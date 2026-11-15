import assert from "node:assert/strict"
import fs from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import { readFileSync, realpathSync, rmSync } from "node:fs"
import { registerHooks, stripTypeScriptTypes } from "node:module"
import { fileURLToPath } from "node:url"
import { before, test } from "node:test"

// Push and Mirror recreate the local tool links (~/.claude/skills/<skill> ->
// ~/.agents/skills/<skill>) on the server. These tests run planPush and
// applyPush end to end: a fake `ssh` runs each remote command locally with
// HOME set to a scratch "remote" home, and local tar uploads go through it.
const FAKE_SSH = `#!/bin/sh
for last; do :; done
HOME="$FAKE_REMOTE_HOME"
export HOME
exec /bin/sh -c "$last"
`

const skip = process.platform === "win32" ? "fake ssh needs a POSIX shell" : false

let localHome = ""
let push: any

async function write(dir: string, content: string) {
  await fs.mkdir(dir, { recursive: true })
  await fs.writeFile(path.join(dir, "SKILL.md"), content)
}

async function link(target: string, at: string) {
  await fs.mkdir(path.dirname(at), { recursive: true })
  await fs.symlink(target, at)
}

before(async () => {
  if (skip) return
  const root = realpathSync(await fs.mkdtemp(path.join(os.tmpdir(), "skillsgate-links-test-")))
  localHome = path.join(root, "local")
  const bin = path.join(root, "bin")
  await fs.mkdir(bin, { recursive: true })
  await fs.writeFile(path.join(bin, "ssh"), FAKE_SSH, { mode: 0o755 })
  process.env.PATH = `${bin}${path.delimiter}${process.env.PATH ?? ""}`
  process.env.HOME = localHome
  process.on("exit", () => {
    try {
      rmSync(root, { recursive: true, force: true })
    } catch {}
  })

  // Local machine: three skills in ~/.agents/skills. anchormd is enabled for
  // Claude Code, cursor-only for Cursor, plain for no tool. Claude's folder
  // also holds a real folder that is not a skill link.
  const canonical = path.join(localHome, ".agents", "skills")
  for (const name of ["anchormd", "cursor-only", "plain"]) {
    await write(path.join(canonical, name), `---\nname: ${name}\n---\n${name}\n`)
  }
  await link("../../.agents/skills/anchormd", path.join(localHome, ".claude", "skills", "anchormd"))
  await link("../../.agents/skills/cursor-only", path.join(localHome, ".cursor", "skills", "cursor-only"))
  await fs.mkdir(path.join(localHome, ".claude", "skills", "synced"), { recursive: true })

  const installed = ["anchormd", "cursor-only", "plain"].map((name) => ({
    scope: "global",
    folderName: name,
    name,
    canonicalPath: path.join(canonical, name),
  }))
  const registry = {
    "claude-code": { name: "claude-code", displayName: "Claude Code", globalSkillsDir: path.join(localHome, ".claude", "skills") },
    cursor: { name: "cursor", displayName: "Cursor", globalSkillsDir: path.join(localHome, ".cursor", "skills") },
    universal: { name: "universal", displayName: "Universal (.agents/skills)", globalSkillsDir: canonical },
  }
  Object.assign(globalThis, { pushLinksTest: { installed, registry } })

  const stubs: Record<string, string> = {
    "../ipc-handlers": `export const listInstalledSkillsInternal = async () => globalThis.pushLinksTest.installed;
      export const agentRegistry = globalThis.pushLinksTest.registry;`,
  }
  registerHooks({
    resolve(specifier, context, nextResolve) {
      if (Object.hasOwn(stubs, specifier)) {
        return { url: `skillsgate-test:${specifier}`, shortCircuit: true }
      }
      if (specifier === "./ssh") return nextResolve("./ssh.ts", context)
      return nextResolve(specifier, context)
    },
    load(url, context, nextLoad) {
      if (url.startsWith("skillsgate-test:")) {
        return { format: "module", source: stubs[url.slice("skillsgate-test:".length)], shortCircuit: true }
      }
      if (url.endsWith(".ts")) {
        return {
          format: "module",
          source: stripTypeScriptTypes(readFileSync(fileURLToPath(url), "utf-8")),
          shortCircuit: true,
        }
      }
      return nextLoad(url, context)
    },
  })
  push = await import("../src/main/db/push.ts")
})

// A remote home where Claude Code is installed and Cursor is not. Claude's
// folder holds Claude's own "synced" folder, a stale link to a remote-only
// skill, and a link to somewhere else.
async function makeRemote(extra?: (home: string) => Promise<void>) {
  const remote = path.join(path.dirname(localHome), `remote-${Math.random().toString(36).slice(2)}`)
  await write(path.join(remote, ".agents", "skills", "old"), "old\n")
  await fs.mkdir(path.join(remote, ".claude", "skills", "synced", "bucket"), { recursive: true })
  await link("../../.agents/skills/old", path.join(remote, ".claude", "skills", "old"))
  await link("/nonexistent/elsewhere", path.join(remote, ".claude", "skills", "elsewhere"))
  if (extra) await extra(remote)
  process.env.FAKE_REMOTE_HOME = remote
  return remote
}

const server = {
  id: "s",
  label: "s",
  host: "127.0.0.1",
  port: 22,
  username: "tester",
  skillsBasePath: "~/.agents/skills",
  sshKeyPath: "/nonexistent-key",
  lastSyncAt: null,
  lastSyncError: null,
  createdAt: "",
}

const brief = (entries: any[]) => entries.map((e) => `${e.tool}:${e.name}->${e.target}`).sort()

test("Push links skills for tools installed on the server and never removes links", { skip }, async () => {
  const remote = await makeRemote()

  const preview = await push.planPush(server, { mirror: false })
  assert.deepEqual(brief(preview.linksToAdd), ["Claude Code:anchormd->../../.agents/skills/anchormd"])
  assert.deepEqual(preview.linksToRemove, [])
  assert.deepEqual(preview.linkConflicts, [])
  assert.deepEqual(preview.toolsNotOnServer, ["Cursor"])

  const result = await push.applyPush(server, preview)
  assert.deepEqual(result.errors, [])
  assert.equal(result.linksAdded, 1)
  assert.equal(result.linksRemoved, 0)

  const claude = path.join(remote, ".claude", "skills")
  assert.equal(await fs.readlink(path.join(claude, "anchormd")), "../../.agents/skills/anchormd")
  assert.equal(
    await fs.readFile(path.join(claude, "anchormd", "SKILL.md"), "utf-8"),
    "---\nname: anchormd\n---\nanchormd\n",
  )
  // Push never deletes: the stale link, the other link and Claude's folder stay.
  assert.equal(await fs.readlink(path.join(claude, "old")), "../../.agents/skills/old")
  assert.equal(await fs.readlink(path.join(claude, "elsewhere")), "/nonexistent/elsewhere")
  assert.ok((await fs.stat(path.join(claude, "synced", "bucket"))).isDirectory())
  // No Cursor folder is created on a server without Cursor.
  await assert.rejects(fs.stat(path.join(remote, ".cursor")))

  const again = await push.planPush(server, { mirror: false })
  assert.deepEqual(again.linksToAdd, [])
  assert.equal(again.linksUnchanged, 1)
})

test("Mirror also removes links into the skills folder that are not local", { skip }, async () => {
  const remote = await makeRemote()

  const preview = await push.planPush(server, { mirror: true })
  assert.deepEqual(brief(preview.linksToAdd), ["Claude Code:anchormd->../../.agents/skills/anchormd"])
  assert.deepEqual(brief(preview.linksToRemove), ["Claude Code:old->../../.agents/skills/old"])
  assert.deepEqual(preview.toDelete.map((e: any) => e.folderName), ["old"])

  const result = await push.applyPush(server, preview)
  assert.deepEqual(result.errors, [])
  assert.equal(result.linksAdded, 1)
  assert.equal(result.linksRemoved, 1)

  const claude = path.join(remote, ".claude", "skills")
  await assert.rejects(fs.lstat(path.join(claude, "old")))
  await assert.rejects(fs.stat(path.join(remote, ".agents", "skills", "old")))
  assert.equal(await fs.readlink(path.join(claude, "anchormd")), "../../.agents/skills/anchormd")
  // Never touched: a link that points elsewhere and Claude's own folder.
  assert.equal(await fs.readlink(path.join(claude, "elsewhere")), "/nonexistent/elsewhere")
  assert.ok((await fs.stat(path.join(claude, "synced", "bucket"))).isDirectory())
})

test("something already in place of a link is reported and left alone", { skip }, async () => {
  const remote = await makeRemote(async (home) => {
    await write(path.join(home, ".claude", "skills", "anchormd"), "a real folder\n")
  })

  const preview = await push.planPush(server, { mirror: true })
  assert.deepEqual(preview.linksToAdd, [])
  assert.deepEqual(preview.linkConflicts.map((e: any) => `${e.tool}:${e.name}`), ["Claude Code:anchormd"])

  const result = await push.applyPush(server, preview)
  assert.deepEqual(result.errors, [])
  assert.equal(
    await fs.readFile(path.join(remote, ".claude", "skills", "anchormd", "SKILL.md"), "utf-8"),
    "a real folder\n",
  )
})

test("link status compares stored server state with local links", { skip }, async () => {
  await makeRemote()
  const before = await push.readRemoteLinkState(server)
  assert.deepEqual((await push.computeLinkStatuses([{ server, state: before }]))[server.id], {
    toAdd: 1,
    onlyOnRemote: 1,
    blocked: 0,
  })
  assert.equal((await push.computeLinkStatuses([{ server, state: null }]))[server.id], null)

  await push.applyPush(server, await push.planPush(server, { mirror: false }))
  const afterPush = await push.readRemoteLinkState(server)
  assert.deepEqual((await push.computeLinkStatuses([{ server, state: afterPush }]))[server.id], {
    toAdd: 0,
    onlyOnRemote: 1,
    blocked: 0,
  })

  await push.applyPush(server, await push.planPush(server, { mirror: true }))
  const afterMirror = await push.readRemoteLinkState(server)
  assert.deepEqual((await push.computeLinkStatuses([{ server, state: afterMirror }]))[server.id], {
    toAdd: 0,
    onlyOnRemote: 0,
    blocked: 0,
  })
  // The stored state survives a JSON round trip, which is how it is saved.
  assert.deepEqual(JSON.parse(JSON.stringify(afterMirror)), afterMirror)
})

test("link status counts an entry in the way as blocked", { skip }, async () => {
  await makeRemote(async (home) => {
    await write(path.join(home, ".claude", "skills", "anchormd"), "a real folder\n")
  })
  const state = await push.readRemoteLinkState(server)
  assert.deepEqual((await push.computeLinkStatuses([{ server, state }]))[server.id], {
    toAdd: 0,
    onlyOnRemote: 1,
    blocked: 1,
  })
})
