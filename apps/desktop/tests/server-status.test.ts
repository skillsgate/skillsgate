import assert from "node:assert/strict"
import { test } from "node:test"

import { computeServerStatus } from "../src/renderer/lib/server-status.ts"

const synced = { lastSyncAt: "2026-11-15 10:00:00", lastSyncError: null }
const local = [
  { folderName: "a", contentHash: "1" },
  { folderName: "b", contentHash: "2" },
]
const remote = [
  { remotePath: "/home/x/.agents/skills/a/SKILL.md", contentHash: "1" },
  { remotePath: "/home/x/.agents/skills/b/SKILL.md", contentHash: "2" },
]

test("skills and tool links both match: in sync", () => {
  const s = computeServerStatus(synced, local, remote, { toAdd: 0, onlyOnRemote: 0, blocked: 0 })
  assert.deepEqual(s, { dotColor: "green", text: "2 skills · in sync" })
})

test("missing tool links count as not yet pushed", () => {
  const s = computeServerStatus(synced, local, remote, { toAdd: 19, onlyOnRemote: 0, blocked: 0 })
  assert.deepEqual(s, { dotColor: "amber", text: "2 skills · 19 tool links not yet pushed" })
})

test("skill and link changes are listed together", () => {
  const s = computeServerStatus(synced, local, remote.slice(0, 1), { toAdd: 1, onlyOnRemote: 0, blocked: 0 })
  assert.deepEqual(s, { dotColor: "amber", text: "2 skills · 1 not yet pushed · 1 tool link not yet pushed" })
})

test("links only on the server and blocked links are shown", () => {
  const s = computeServerStatus(synced, local, remote, { toAdd: 0, onlyOnRemote: 47, blocked: 1 })
  assert.deepEqual(s, {
    dotColor: "grey",
    text: "2 skills · 47 tool links only on remote · 1 tool link blocked",
  })
})

test("without link state the status is about skills only", () => {
  assert.deepEqual(computeServerStatus(synced, local, remote, null), {
    dotColor: "green",
    text: "2 skills · in sync",
  })
  assert.deepEqual(computeServerStatus(synced, local, remote), {
    dotColor: "green",
    text: "2 skills · in sync",
  })
})
