import assert from "node:assert/strict"
import crypto from "node:crypto"
import fs from "node:fs/promises"
import net from "node:net"
import os from "node:os"
import path from "node:path"
import { test } from "node:test"

import {
  explainSshError,
  scanRemoteSkills,
  testConnection,
} from "../src/main/db/ssh.ts"

// The scanner and connection helpers spawn `ssh`. These tests put a fake `ssh`
// first on PATH that runs the remote command locally with /bin/sh, so the real
// shell commands and output parsing are exercised without a remote machine.
const FAKE_SSH = `#!/bin/sh
for last; do :; done
if [ -n "$FAKE_SSH_STDERR" ]; then
  printf '%s\\n' "$FAKE_SSH_STDERR" >&2
  exit 255
fi
exec /bin/sh -c "$last"
`

const skip = process.platform === "win32" ? "fake ssh needs a POSIX shell" : false

async function useFakeSsh(t: { after: (fn: () => unknown) => void }) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "skillsgate-ssh-test-"))
  t.after(() => fs.rm(root, { recursive: true, force: true }))
  const bin = path.join(root, "bin")
  const home = path.join(root, "home")
  await fs.mkdir(bin)
  await fs.mkdir(home)
  await fs.writeFile(path.join(bin, "ssh"), FAKE_SSH, { mode: 0o755 })
  for (const [key, value] of [
    ["PATH", `${bin}${path.delimiter}${process.env.PATH ?? ""}`],
    ["HOME", home],
    ["FAKE_SSH_STDERR", undefined],
  ] as const) {
    const previous = process.env[key]
    if (value === undefined) delete process.env[key]
    else process.env[key] = value
    t.after(() => {
      if (previous === undefined) delete process.env[key]
      else process.env[key] = previous
    })
  }
  return home
}

function server(overrides: Record<string, unknown> = {}) {
  return {
    id: "test",
    label: "test",
    host: "127.0.0.1",
    port: 22,
    username: "tester",
    skillsBasePath: "~/.agents/skills",
    sshKeyPath: "/nonexistent-key",
    lastSyncAt: null,
    lastSyncError: null,
    createdAt: "",
    ...overrides,
  }
}

function sha256(s: string): string {
  return crypto.createHash("sha256").update(s, "utf-8").digest("hex")
}

test("scan returns every remote SKILL.md exactly as stored", { skip }, async (t) => {
  const home = await useFakeSsh(t)
  const files: Record<string, string> = {
    // No trailing newline: the next file's delimiter must not be glued onto it.
    "a-no-newline": "---\nname: a-no-newline\ndescription: First\n---\nbody without newline",
    "b-newline": "---\nname: b-newline\n---\n\nbody\n",
    "c-blank-lines": "\n---\nname: c-blank-lines\ndescription: Third\n---\n\nbody\n\n",
    "d-empty": "",
  }
  for (const [folder, content] of Object.entries(files)) {
    const dir = path.join(home, ".agents", "skills", folder)
    await fs.mkdir(dir, { recursive: true })
    await fs.writeFile(path.join(dir, "SKILL.md"), content)
  }

  const scanned = await scanRemoteSkills(server())
  const byFolder = new Map(
    scanned.map((s) => [path.basename(path.dirname(s.remotePath)), s]),
  )

  assert.deepEqual([...byFolder.keys()].sort(), Object.keys(files).sort())
  for (const [folder, content] of Object.entries(files)) {
    const skill = byFolder.get(folder)!
    assert.equal(skill.content, content, `${folder} content`)
    // Push and the status hints compare this with sha256 of the local file.
    assert.equal(skill.contentHash, sha256(content), `${folder} hash`)
  }
  assert.equal(byFolder.get("a-no-newline")!.name, "a-no-newline")
  assert.equal(byFolder.get("a-no-newline")!.description, "First")
  assert.equal(byFolder.get("c-blank-lines")!.name, "c-blank-lines")
  assert.equal(byFolder.get("c-blank-lines")!.description, "Third")
})

test("No route to host on macOS points to the Local Network setting", () => {
  const raw = "ssh: connect to host sulvali.local port 22: No route to host"
  const mac = explainSshError(raw, "darwin")
  assert.ok(mac.startsWith(raw))
  assert.match(mac, /Privacy & Security > Local Network/)
  assert.equal(explainSshError(raw, "linux"), raw)
  assert.equal(explainSshError("Permission denied (publickey).", "darwin"), "Permission denied (publickey).")
})

test("connection errors carry the Local Network hint on macOS", { skip }, async (t) => {
  await useFakeSsh(t)
  process.env.FAKE_SSH_STDERR = "ssh: connect to host 127.0.0.1 port 22: No route to host"

  // A closed local port, so the app's own connection attempt fails fast.
  const probe = net.createServer()
  await new Promise<void>((resolve) => probe.listen(0, "127.0.0.1", resolve))
  const port = (probe.address() as net.AddressInfo).port
  await new Promise<void>((resolve) => probe.close(() => resolve()))

  const result = await testConnection(server({ port }))
  assert.equal(result.ok, false)
  if (process.platform === "darwin") {
    assert.match(result.error ?? "", /Privacy & Security > Local Network/)
  } else {
    assert.equal(result.error, process.env.FAKE_SSH_STDERR)
  }
})
