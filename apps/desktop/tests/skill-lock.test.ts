import assert from "node:assert/strict"
import fs from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import { test, type TestContext } from "node:test"

import { readSkillLock } from "../src/main/skill-lock.ts"

const entry = {
  source: "example/skills",
  sourceType: "github",
  originalUrl: "https://github.com/example/skills",
  skillFolderHash: "original",
  installedAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
}

async function fixture(t: TestContext) {
  const directory = await fs.mkdtemp(
    path.join(os.tmpdir(), "skillsgate-lock-test-"),
  )
  t.after(() => fs.rm(directory, { recursive: true, force: true }))
  return path.join(directory, ".skill-lock.json")
}

test("writable v1 reads preserve existing entries and metadata", async (t) => {
  const filePath = await fixture(t)
  const lock = {
    version: 1,
    skills: { alpha: entry, beta: entry },
    custom: "keep",
  }
  await fs.writeFile(filePath, JSON.stringify(lock))
  assert.deepEqual(await readSkillLock({ forWrite: true, filePath }), lock)
})

test("a missing lock permits first installation", async (t) => {
  const filePath = await fixture(t)
  assert.deepEqual(await readSkillLock({ forWrite: true, filePath }), {
    version: 1,
    skills: {},
  })
})

test("missing lock directories permit initialization under a writable ancestor", async (t) => {
  const filePath = path.join(
    path.dirname(await fixture(t)),
    "missing",
    ".agents",
    ".skill-lock.json",
  )
  assert.deepEqual(await readSkillLock({ forWrite: true, filePath }), {
    version: 1,
    skills: {},
  })
  await assert.rejects(fs.stat(path.dirname(filePath)), { code: "ENOENT" })
})

for (const [label, raw] of [
  [
    "unsupported version",
    JSON.stringify({ version: 3, skills: { alpha: entry } }),
  ],
  ["malformed JSON", "{broken"],
  ["missing skills map", JSON.stringify({ version: 1 })],
  ["array skills map", JSON.stringify({ version: 1, skills: [] })],
]) {
  test(`${label} refuses writes while preserving the lock`, async (t) => {
    const filePath = await fixture(t)
    await fs.writeFile(filePath, raw)
    const before = await fs.readFile(filePath)
    await assert.rejects(readSkillLock({ forWrite: true, filePath }))
    assert.deepEqual(await fs.readFile(filePath), before)
    assert.deepEqual(await readSkillLock({ filePath }), {
      version: 1,
      skills: {},
    })
  })
}

test("a read error is not treated as a missing writable lock", async (t) => {
  const filePath = await fixture(t)
  await fs.mkdir(filePath)
  await assert.rejects(readSkillLock({ forWrite: true, filePath }))
  assert.equal((await fs.stat(filePath)).isDirectory(), true)
})

test("permission denial refuses writes and retains original bytes", async (t) => {
  if (process.platform === "win32" || process.getuid?.() === 0) {
    t.skip("POSIX file modes require a non-root POSIX account")
    return
  }
  const filePath = await fixture(t)
  const original = JSON.stringify({ version: 1, skills: { alpha: entry } })
  await fs.writeFile(filePath, original, { mode: 0o600 })
  try {
    await fs.chmod(filePath, 0)
    await assert.rejects(readSkillLock({ forWrite: true, filePath }), {
      code: "EACCES",
    })
  } finally {
    await fs.chmod(filePath, 0o600)
  }
  assert.equal(await fs.readFile(filePath, "utf-8"), original)
})

test("a readable but unwritable lock refuses before directory changes", async (t) => {
  if (process.platform === "win32" || process.getuid?.() === 0) {
    t.skip("POSIX file modes require a non-root POSIX account")
    return
  }
  const filePath = await fixture(t)
  const original = JSON.stringify({ version: 1, skills: { alpha: entry } })
  await fs.writeFile(filePath, original, { mode: 0o600 })
  try {
    await fs.chmod(filePath, 0o400)
    await assert.rejects(readSkillLock({ forWrite: true, filePath }), {
      code: "EACCES",
    })
    assert.equal(await fs.readFile(filePath, "utf-8"), original)
  } finally {
    await fs.chmod(filePath, 0o600)
  }
})
