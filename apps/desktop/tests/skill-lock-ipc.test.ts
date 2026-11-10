import assert from "node:assert/strict"
import fs from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import { registerHooks, stripTypeScriptTypes } from "node:module"
import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { test } from "node:test"

test("skill mutations preflight the lock and preserve supported entries", async (t) => {
  const home = await fs.mkdtemp(path.join(os.tmpdir(), "skillsgate-ipc-test-"))
  t.after(() => fs.rm(home, { recursive: true, force: true }))
  for (const key of [
    "XDG_CONFIG_HOME",
    "FACTORY_HOME",
    "OB1_HOME",
    "CLAUDE_CONFIG_DIR",
  ]) {
    const previous = process.env[key]
    process.env[key] = path.join(home, key)
    t.after(() => {
      if (previous === undefined) delete process.env[key]
      else process.env[key] = previous
    })
  }
  const handlers = new Map<string, (...args: any[]) => Promise<any>>()
  const bridge = { handlers, home, os }
  Object.assign(globalThis, { skillLockTest: bridge })
  t.after(() => Reflect.deleteProperty(globalThis, "skillLockTest"))

  const stubs: Record<string, string> = {
    electron: `export const ipcMain = {handle: (name, fn) => globalThis.skillLockTest.handlers.set(name, fn)};
      export const net = {}; export const shell = {}; export const app = {};`,
    "node:os": `export default {...globalThis.skillLockTest.os, homedir: () => globalThis.skillLockTest.home};`,
    "gray-matter": `export default function (raw) {return {data: {name: "source", description: "Test skill"}, content: raw};}`,
    "./db/index": `export const openDb = () => ({});`,
    "./db/settings": `export class SettingsStore {get(key, fallback) {return key === "agents.active" ? ["universal"] : fallback;}}`,
    "./db/servers": `export class RemoteServerStore {}`,
    "./db/skills": `export class RemoteSkillStore {}`,
    "./db/favorites": `export class FavoritesStore {}`,
    "./db/skills-cache": `export const loadCachedSkills = () => []; export const saveCachedSkills = () => {};`,
    "./db/trending-cache": `export const loadTrendingCache = () => []; export const saveTrendingCache = () => {};`,
    "./db/ssh": `export const testConnection = () => {}; export const syncRemoteServer = () => {};
      export const readRemoteFile = () => {}; export const writeRemoteFile = () => {};`,
    "./db/push": `export const planPush = () => {}; export const applyPush = () => {};`,
    "./auto-updater": `export const checkForAppUpdates = () => {}; export const getUpdateState = () => {};
      export const quitAndInstallUpdate = () => {};`,
  }
  const hooks = registerHooks({
    resolve(specifier, context, nextResolve) {
      if (Object.hasOwn(stubs, specifier)) {
        return { url: `skillsgate-test:${specifier}`, shortCircuit: true }
      }
      if (specifier === "./skill-lock") {
        return nextResolve("./skill-lock.ts", context)
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
          source: stripTypeScriptTypes(
            readFileSync(fileURLToPath(url), "utf-8"),
          ),
          shortCircuit: true,
        }
      }
      return nextLoad(url, context)
    },
  })
  t.after(() => hooks.deregister())
  const { registerIpcHandlers } = await import("../src/main/ipc-handlers.ts")
  registerIpcHandlers()

  const agents = path.join(home, ".agents")
  const lockPath = path.join(agents, ".skill-lock.json")
  const canonical = path.join(agents, "skills")
  const keptSkill = path.join(canonical, "kept", "SKILL.md")
  const source = path.join(home, "source")
  await fs.mkdir(source)
  await fs.writeFile(path.join(source, "SKILL.md"), "Source skill\n")
  await fs.mkdir(path.dirname(keptSkill), { recursive: true })
  await fs.writeFile(keptSkill, "Existing skill\n")
  const call = (name: string, ...args: any[]) =>
    handlers.get(name)!(null, ...args)

  for (const raw of [
    JSON.stringify({ version: 3, skills: { kept: { source: "keep" } } }),
    "{broken",
  ]) {
    await fs.writeFile(lockPath, raw)
    const before = await fs.readFile(lockPath)
    for (const [operation, args] of [
      ["skills:create", [{ name: "new", agentNames: ["universal"] }]],
      ["skills:remove", ["kept"]],
      ["skills:install", [source, ["universal"], "global"]],
      ["skills:update", ["kept"]],
    ] as const) {
      await t.test(
        `${operation} refuses ${raw.startsWith("{broken") ? "malformed" : "v3"} lock`,
        async () => {
          await assert.rejects(call(operation, ...args), /skill lock/i)
          assert.deepEqual(await fs.readFile(lockPath), before)
          assert.equal(
            await fs.readFile(keptSkill, "utf-8"),
            "Existing skill\n",
          )
          assert.deepEqual(await fs.readdir(canonical), ["kept"])
        },
      )
    }
  }

  const original = {
    version: 1,
    skills: { kept: { source: "keep", custom: "entry metadata" } },
    custom: "lock metadata",
  }
  await fs.writeFile(lockPath, JSON.stringify(original))
  if (process.platform !== "win32" && process.getuid?.() !== 0) {
    for (const mode of [0, 0o400]) {
      await t.test(
        `create and remove refuse lock mode ${mode.toString(8)}`,
        async () => {
          await fs.chmod(lockPath, mode)
          try {
            await assert.rejects(
              call("skills:create", { name: "new", agentNames: ["universal"] }),
              { code: "EACCES" },
            )
            await assert.rejects(call("skills:remove", "kept"), {
              code: "EACCES",
            })
            assert.equal(
              await fs.readFile(keptSkill, "utf-8"),
              "Existing skill\n",
            )
            assert.deepEqual(await fs.readdir(canonical), ["kept"])
          } finally {
            await fs.chmod(lockPath, 0o600)
          }
          assert.deepEqual(
            JSON.parse(await fs.readFile(lockPath, "utf-8")),
            original,
          )
        },
      )
    }
  }
  if (process.platform !== "win32" && process.getuid?.() !== 0) {
    await t.test(
      "a missing lock in an unwritable parent refuses before skill changes",
      async () => {
        await fs.unlink(lockPath)
        await fs.chmod(agents, 0o500)
        try {
          await assert.rejects(
            call("skills:create", { name: "new", agentNames: ["universal"] }),
            { code: "EACCES" },
          )
          assert.deepEqual(await fs.readdir(canonical), ["kept"])
        } finally {
          await fs.chmod(agents, 0o700)
          await fs.writeFile(lockPath, JSON.stringify(original))
        }
      },
    )
  }
  await call("skills:create", { name: "new", agentNames: ["universal"] })
  const created = JSON.parse(await fs.readFile(lockPath, "utf-8"))
  assert.deepEqual(created.skills.kept, original.skills.kept)
  assert.equal(created.custom, original.custom)
  assert.equal(created.skills.new.sourceType, "local")
  assert.match(
    await fs.readFile(path.join(canonical, "new", "SKILL.md"), "utf-8"),
    /name: new/,
  )
  await call("skills:remove", "new")
  assert.deepEqual(JSON.parse(await fs.readFile(lockPath, "utf-8")), original)
  assert.deepEqual(await fs.readdir(canonical), ["kept"])
  const installed = await call(
    "skills:install",
    source,
    ["universal"],
    "global",
  )
  assert.equal(installed[0].success, true)
  assert.equal(
    await fs.readFile(path.join(canonical, "source", "SKILL.md"), "utf-8"),
    "Source skill\n",
  )
  await fs.writeFile(path.join(source, "SKILL.md"), "Updated source skill\n")
  await call("skills:update", "source")
  assert.equal(
    await fs.readFile(path.join(canonical, "source", "SKILL.md"), "utf-8"),
    "Updated source skill\n",
  )
  const updated = JSON.parse(await fs.readFile(lockPath, "utf-8"))
  assert.deepEqual(updated.skills.kept, original.skills.kept)
  assert.equal(updated.custom, original.custom)
  await call("skills:remove", "source")
  assert.deepEqual(JSON.parse(await fs.readFile(lockPath, "utf-8")), original)
})
