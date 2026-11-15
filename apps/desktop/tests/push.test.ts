import assert from "node:assert/strict"
import crypto from "node:crypto"
import fs from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import { readFileSync } from "node:fs"
import { registerHooks, stripTypeScriptTypes } from "node:module"
import { fileURLToPath } from "node:url"
import { test } from "node:test"

function sha256(s: string): string {
  return crypto.createHash("sha256").update(s, "utf-8").digest("hex")
}

test("push candidates are the skills stored in ~/.agents/skills", async (t) => {
  const home = await fs.mkdtemp(path.join(os.tmpdir(), "skillsgate-push-test-"))
  t.after(() => fs.rm(home, { recursive: true, force: true }))
  for (const key of ["HOME", "USERPROFILE"]) {
    const previous = process.env[key]
    process.env[key] = home
    t.after(() => {
      if (previous === undefined) delete process.env[key]
      else process.env[key] = previous
    })
  }

  const canonical = path.join(home, ".agents", "skills")
  const write = async (dir: string, content: string) => {
    await fs.mkdir(dir, { recursive: true })
    await fs.writeFile(path.join(dir, "SKILL.md"), content)
  }
  const kept = path.join(canonical, "kept")
  await write(kept, "---\nname: kept\n---\nbody\n")
  // A folder in ~/.agents/skills that links elsewhere: the scan reports its real path.
  const linkedTarget = path.join(home, ".claude", "skills", "linked")
  await write(linkedTarget, "linked\n")
  // A tool's built-in skill outside ~/.agents/skills.
  const builtIn = path.join(home, ".codex", "skills", ".system", "imagegen")
  await write(builtIn, "built-in\n")
  // A folder without SKILL.md.
  const empty = path.join(canonical, "empty")
  await fs.mkdir(empty, { recursive: true })

  const installed = [
    { scope: "global", folderName: "kept", name: "Kept", canonicalPath: kept },
    { scope: "global", folderName: "linked", name: "Linked", canonicalPath: linkedTarget },
    { scope: "global", folderName: "imagegen", name: "Imagegen", canonicalPath: builtIn },
    { scope: "global", folderName: "empty", name: "Empty", canonicalPath: empty },
    { scope: "project", folderName: "proj", name: "Proj", canonicalPath: path.join(canonical, "proj") },
  ]
  Object.assign(globalThis, { pushTest: { installed } })
  t.after(() => Reflect.deleteProperty(globalThis, "pushTest"))

  const stubs: Record<string, string> = {
    "../ipc-handlers": `export const listInstalledSkillsInternal = async () => globalThis.pushTest.installed;`,
    "./ssh": `export const scanRemoteSkills = async () => [];
      export const uploadSkillDir = async () => {}; export const deleteRemoteSkillDir = async () => {};`,
  }
  const hooks = registerHooks({
    resolve(specifier, context, nextResolve) {
      if (Object.hasOwn(stubs, specifier)) {
        return { url: `skillsgate-test:${specifier}`, shortCircuit: true }
      }
      return nextResolve(specifier, context)
    },
    load(url, context, nextLoad) {
      if (url.startsWith("skillsgate-test:")) {
        return {
          format: "module",
          source: stubs[url.slice("skillsgate-test:".length)],
          shortCircuit: true,
        }
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
  t.after(() => hooks.deregister())

  const { listLocalPushCandidates } = await import("../src/main/db/push.ts")
  const candidates = await listLocalPushCandidates()

  assert.deepEqual(
    candidates.map((c: { folderName: string; contentHash: string }) => ({
      folderName: c.folderName,
      contentHash: c.contentHash,
    })),
    [{ folderName: "kept", contentHash: sha256("---\nname: kept\n---\nbody\n") }],
  )
})
