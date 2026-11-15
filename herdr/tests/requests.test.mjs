import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { BUSY, NOTICE, REV, createChannel } from "../skillsgate/mods/skillsgate/channel.js";
import { createMachine } from "../skillsgate/mods/skillsgate/machine.js";
import { runRequest } from "../skillsgate/mods/skillsgate/requests.js";
import { FIXTURE, SKILL, makeHome } from "./helpers.mjs";

const hasGit = spawnSync("git", ["--version"]).status === 0;

// A local repository standing in for GitHub, as in install.test.mjs: made once,
// with an environment that never reads the maintainer's own git configuration.
let repoDir = null;
function repo() {
  if (repoDir) return repoDir;
  const root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "sg req repo.")));
  process.on("exit", () => fs.rmSync(root, { recursive: true, force: true }));
  const dir = path.join(root, "acme skills");
  const gitHome = path.join(root, "git-home");
  fs.mkdirSync(gitHome);
  for (const [rel, text] of Object.entries({ "skills/alpha/SKILL.md": SKILL("alpha"), "skills/alpha/extra.txt": "extra", "beta/SKILL.md": SKILL("beta") })) {
    fs.mkdirSync(path.dirname(path.join(dir, rel)), { recursive: true });
    fs.writeFileSync(path.join(dir, rel), text);
  }
  const env = { PATH: process.env.PATH, HOME: gitHome, GIT_CONFIG_NOSYSTEM: "1" };
  const git = (...args) => execFileSync("git", args, { cwd: dir, env, stdio: "pipe" });
  git("init", "-q", "-b", "main");
  git("add", "-A");
  git("-c", "user.name=t", "-c", "user.email=t@t", "-c", "commit.gpgsign=false", "commit", "-q", "-m", "init");
  repoDir = dir;
  return dir;
}

// A temp home with real `sh`, a machine on it, a Map standing in for Herdr's
// shared store, and a caller that keeps the latest good scan per machine the
// way the panel does: `known(on)` reads it, `scan(on)` scans and keeps it,
// `prime(on)` gives the caller a first scan (as the panel has before any
// dialog opens). `ops` replaces machine operations (to make one warn or
// throw). Every exec call, claim, touch and runRequest scan is recorded, and
// so is the lock text seen while an operation runs. Installs clone the local
// repository; `clock` (`{ now }`) drives the channel's time when given, and
// `onExec(script)` runs before every exec call.
function setup({ files = FIXTURE, ops = {}, clock = null, onExec = () => {} } = {}) {
  const h = makeHome(files);
  const calls = [];
  const exec = (...args) => {
    calls.push(args);
    onExec(args[0]);
    return h.exec(...args);
  };
  const real = createMachine({ exec, readText: h.readText, cloneUrl: () => "file://" + repo() });
  const store = new Map();
  const base = createChannel({
    get: (key) => store.get(key),
    set: (key, value) => store.set(key, value),
    ...(clock ? { now: () => clock.now } : {}),
  });
  const claims = [];
  const touches = []; // each touch, and whether the lock was still live when it came
  const channel = {
    ...base,
    claim(on, text) {
      claims.push({ on, text });
      return base.claim(on, text);
    },
    touch(on) {
      touches.push({ on, live: base.busyAt(on) });
      return base.touch(on);
    },
  };
  const during = []; // what the lock said while an operation ran
  const watched = (name) => async (on, ...rest) => {
    during.push({ op: name, on, busy: channel.textAt(on) });
    return (ops[name] ?? real[name])(on, ...rest);
  };
  const machine = { ...real, link: watched("link"), unlink: watched("unlink"), remove: watched("remove"), install: watched("install") };
  const latest = new Map();
  const keep = (on, r) => {
    if (r.ok) latest.set(on ?? "", { scan: r.scan, skills: r.skills });
  };
  const scans = [];
  const scan = async (on) => {
    scans.push({ on, locked: channel.busyAt(on) });
    const r = await real.scan(on);
    keep(on, r);
    return r;
  };
  const known = (on) => latest.get(on ?? "") ?? null;
  const prime = async (on = null) => keep(on, await real.scan(on));
  const deps = { channel, machine, known, scan };
  const keyOf = (rel) => fs.realpathSync(h.path(rel));
  return { h, calls, store, channel, claims, touches, during, scans, deps, keyOf, prime };
}

const exists = (p) => fs.existsSync(p);
const isLink = (p) => {
  try {
    return fs.lstatSync(p).isSymbolicLink();
  } catch {
    return false;
  }
};
const notice = (channel) => {
  const n = channel.notice();
  return n && { kind: n.kind, text: n.text };
};

test("link adds the skill to a tool, with the brief's texts", async () => {
  const s = setup();
  await s.prime();
  await runRequest({ id: "1", op: "link", on: null, key: s.keyOf(".agents/skills/alpha"), tool: "cursor" }, s.deps);
  assert.equal(fs.readlinkSync(s.h.path(".cursor/skills/alpha")), "../../.agents/skills/alpha");
  assert.deepEqual(s.claims, [{ on: null, text: "Adding alpha to Cursor…" }]);
  assert.deepEqual(s.during, [{ op: "link", on: null, busy: "Adding alpha to Cursor…" }]);
  assert.deepEqual(notice(s.channel), { kind: "done", text: "Added alpha to Cursor" });
  assert.equal(s.channel.busyAt(null), false);
  assert.equal(s.channel.rev(null), 1);
});

test("unlink removes the tool's link and keeps the shared copy", async () => {
  const s = setup();
  await s.prime();
  await runRequest({ id: "1", op: "unlink", on: null, key: s.keyOf(".agents/skills/alpha"), tool: "claude-code" }, s.deps);
  assert.equal(exists(s.h.path(".claude/skills/alpha")), false);
  assert.equal(exists(s.h.path(".agents/skills/alpha/SKILL.md")), true);
  assert.deepEqual(s.claims, [{ on: null, text: "Removing alpha from Claude Code…" }]);
  assert.deepEqual(s.during.map((d) => d.busy), ["Removing alpha from Claude Code…"]);
  assert.deepEqual(notice(s.channel), { kind: "done", text: "Removed alpha from Claude Code" });
  assert.equal(s.channel.busyAt(null), false);
  assert.equal(s.channel.rev(null), 1);
});

test("remove deletes the skill and every link to it", async () => {
  const s = setup();
  await s.prime();
  await runRequest({ id: "1", op: "remove", on: null, key: s.keyOf(".agents/skills/alpha") }, s.deps);
  assert.equal(exists(s.h.path(".agents/skills/alpha")), false);
  assert.equal(isLink(s.h.path(".claude/skills/alpha")), false);
  assert.equal(exists(s.h.path(".agents/skills/it's odd name/SKILL.md")), true);
  assert.deepEqual(s.claims, [{ on: null, text: "Deleting alpha…" }]);
  assert.deepEqual(s.during.map((d) => d.busy), ["Deleting alpha…"]);
  assert.deepEqual(notice(s.channel), { kind: "done", text: "Deleted alpha" });
  assert.equal(s.channel.busyAt(null), false);
  assert.equal(s.channel.rev(null), 1);
});

test("remove of a skill linked from elsewhere removes it from all tools and keeps its folder", async () => {
  const s = setup();
  await s.prime();
  await runRequest({ id: "1", op: "remove", on: null, key: s.keyOf("ext/outside") }, s.deps);
  assert.equal(isLink(s.h.path(".cursor/skills/outside")), false);
  assert.equal(exists(s.h.path(".cursor/skills/outside")), false);
  assert.equal(exists(s.h.path("ext/outside/SKILL.md")), true, "the folder is kept");
  assert.deepEqual(s.claims, [{ on: null, text: "Removing outside from all tools…" }]);
  assert.deepEqual(s.during.map((d) => d.busy), ["Removing outside from all tools…"]);
  assert.deepEqual(notice(s.channel), { kind: "done", text: "Removed outside from all tools" });
  assert.equal(s.channel.busyAt(null), false);
  assert.equal(s.channel.rev(null), 1);
});

test("remove of a skill linked from elsewhere names a named machine while running", async () => {
  const s = setup();
  await s.prime("vps");
  await runRequest({ id: "1", op: "remove", on: "vps", key: s.keyOf("ext/outside") }, s.deps);
  assert.deepEqual(s.claims, [{ on: "vps", text: "Removing outside from all tools on vps…" }]);
  assert.deepEqual(notice(s.channel), { kind: "done", text: "Removed outside from all tools" });
  assert.equal(isLink(s.h.path(".cursor/skills/outside")), false);
  assert.equal(exists(s.h.path("ext/outside/SKILL.md")), true);
});

test("a named machine is named while running and not when done", async () => {
  const s = setup();
  await s.prime("vps");
  const key = s.keyOf(".agents/skills/alpha");
  await runRequest({ id: "1", op: "link", on: "vps", key, tool: "cursor" }, s.deps);
  assert.deepEqual(notice(s.channel), { kind: "done", text: "Added alpha to Cursor" });
  await runRequest({ id: "2", op: "unlink", on: "vps", key, tool: "cursor" }, s.deps);
  assert.deepEqual(notice(s.channel), { kind: "done", text: "Removed alpha from Cursor" });
  await runRequest({ id: "3", op: "remove", on: "vps", key }, s.deps);
  assert.deepEqual(notice(s.channel), { kind: "done", text: "Deleted alpha" });
  assert.deepEqual(s.claims, [
    { on: "vps", text: "Adding alpha to Cursor on vps…" },
    { on: "vps", text: "Removing alpha from Cursor on vps…" },
    { on: "vps", text: "Deleting alpha on vps…" },
  ]);
  assert.deepEqual(s.during.map((d) => [d.on, d.busy]), [
    ["vps", "Adding alpha to Cursor on vps…"],
    ["vps", "Removing alpha from Cursor on vps…"],
    ["vps", "Deleting alpha on vps…"],
  ]);
  assert.equal(exists(s.h.path(".agents/skills/alpha")), false);
  assert.equal(s.channel.rev("vps"), 3);
  assert.equal(s.channel.rev(null), 0, "this computer's revision is left alone");
  assert.equal(s.channel.busyAt("vps"), false);
});

test("each run scans under the lock, then again after releasing it", async () => {
  const s = setup();
  await s.prime("vps");
  const key = s.keyOf(".agents/skills/alpha");
  await runRequest({ id: "1", op: "link", on: "vps", key, tool: "cursor" }, s.deps);
  assert.deepEqual(s.scans, [
    { on: "vps", locked: true },
    { on: "vps", locked: false },
  ]);
  assert.deepEqual(s.touches, [{ on: "vps", live: true }], "the lock is refreshed once, after the fresh scan");
});

test("a link made on disk after the caller's last scan is really removed", async () => {
  const s = setup();
  await s.prime();
  // Made by another program after the panel's scan: the panel does not know it.
  fs.symlinkSync("../../.agents/skills/alpha", s.h.path(".cursor/skills/alpha"));
  await runRequest({ id: "1", op: "unlink", on: null, key: s.keyOf(".agents/skills/alpha"), tool: "cursor" }, s.deps);
  assert.equal(isLink(s.h.path(".cursor/skills/alpha")), false);
  assert.equal(exists(s.h.path(".cursor/skills/alpha")), false);
  assert.equal(exists(s.h.path(".agents/skills/alpha/SKILL.md")), true);
  assert.deepEqual(notice(s.channel), { kind: "done", text: "Removed alpha from Cursor" });
});

test("a skill deleted on disk since the caller's last scan is no longer there, and nothing changes", async () => {
  const s = setup();
  await s.prime();
  const key = s.keyOf(".agents/skills/alpha"); // the real path the panel knew
  fs.rmSync(s.h.path(".agents/skills/alpha"), { recursive: true });
  await runRequest({ id: "1", op: "link", on: null, key, tool: "cursor" }, s.deps);
  assert.deepEqual(notice(s.channel), { kind: "error", text: "That skill is no longer on this computer." });
  assert.deepEqual(s.claims, [{ on: null, text: "Adding alpha to Cursor…" }], "named as the panel last saw it");
  assert.deepEqual(s.during, [], "no operation ran");
  assert.equal(exists(s.h.path(".cursor/skills/alpha")), false);
  assert.equal(isLink(s.h.path(".cursor/skills/alpha")), false);
  assert.equal(isLink(s.h.path(".claude/skills/alpha")), true, "the other tool's dangling link is left alone");
  assert.equal(s.channel.busyAt(null), false);
  assert.equal(s.channel.rev(null), 1, "a dialog still showing it reads again");
});

test("a key no scan has seen is named by its folder and is no longer on the machine", async () => {
  const s = setup();
  await runRequest({ id: "1", op: "remove", on: null, key: s.h.home + "/.agents/skills/gone" }, s.deps);
  assert.deepEqual(notice(s.channel), { kind: "error", text: "That skill is no longer on this computer." });
  await runRequest({ id: "2", op: "link", on: "vps", key: s.h.home + "/.agents/skills/gone", tool: "cursor" }, s.deps);
  assert.deepEqual(notice(s.channel), { kind: "error", text: "That skill is no longer on vps." });
  assert.deepEqual(s.claims, [
    { on: null, text: "Deleting gone…" },
    { on: "vps", text: "Adding gone to Cursor on vps…" },
  ]);
  assert.deepEqual(s.during, []);
  assert.equal(s.channel.busyAt(null), false);
  assert.equal(s.channel.busyAt("vps"), false);
  // Only the two scans under the lock ran, and nothing on disk changed.
  assert.equal(s.calls.length, 2);
  assert.equal(exists(s.h.path(".agents/skills/alpha/SKILL.md")), true);
  assert.equal(s.channel.rev(null), 1);
  assert.equal(s.channel.rev("vps"), 1);
});

test("a skill the caller has not seen yet is named by its folder while running", async () => {
  const s = setup();
  const key = s.keyOf(".agents/skills/it's odd name");
  await runRequest({ id: "1", op: "link", on: null, key, tool: "cursor" }, s.deps);
  assert.deepEqual(s.claims, [{ on: null, text: "Adding it's odd name to Cursor…" }]);
  assert.deepEqual(notice(s.channel), { kind: "done", text: "Added odd to Cursor" }, "the fresh scan names it when done");
});

test("a scan that fails under the lock says so, releases the lock and runs nothing", async () => {
  const s = setup();
  await s.prime("vps");
  await s.prime(null);
  const before = s.calls.length;
  const failing = { ...s.deps, scan: async () => ({ ok: false, error: "machine vps is unreachable" }) };
  await runRequest({ id: "1", op: "link", on: "vps", key: s.keyOf(".agents/skills/alpha"), tool: "cursor" }, failing);
  assert.deepEqual(notice(s.channel), { kind: "error", text: "Can't check vps: machine vps is unreachable" });
  assert.deepEqual(s.claims, [{ on: "vps", text: "Adding alpha to Cursor on vps…" }]);
  assert.equal(s.channel.busyAt("vps"), false);
  const throwing = { ...s.deps, scan: async () => Promise.reject(new Error("sh: timeout")) };
  await runRequest({ id: "2", op: "remove", on: null, key: s.keyOf(".agents/skills/alpha") }, throwing);
  assert.deepEqual(notice(s.channel), { kind: "error", text: "Can't check this computer: sh: timeout" });
  assert.equal(s.channel.busyAt(null), false);
  assert.deepEqual(s.during, [], "no operation ran");
  assert.equal(s.calls.length, before, "nothing ran on the machine");
  assert.equal(s.channel.rev("vps"), 0, "nothing changed, so no dialog is told to read again");
  assert.equal(s.channel.rev(null), 0);
  assert.equal(isLink(s.h.path(".cursor/skills/alpha")), false);
  assert.equal(exists(s.h.path(".agents/skills/alpha/SKILL.md")), true);
});

test("a busy machine gives the warning and changes nothing", async () => {
  const s = setup();
  s.channel.claim(null, "Installing pdf…");
  s.channel.claim("vps", "Installing pdf on vps…");
  const key = s.keyOf(".agents/skills/alpha");
  await runRequest({ id: "1", op: "link", on: null, key, tool: "cursor" }, s.deps);
  assert.deepEqual(notice(s.channel), { kind: "warn", text: "This computer is busy. Try again when it finishes." });
  await runRequest({ id: "2", op: "remove", on: "vps", key }, s.deps);
  assert.deepEqual(notice(s.channel), { kind: "warn", text: "vps is busy. Try again when it finishes." });
  assert.deepEqual(s.during, []);
  assert.deepEqual(s.scans, []);
  assert.deepEqual(s.touches, [], "another request's lock is not refreshed");
  assert.deepEqual(s.calls, [], "nothing ran on the machine, not even a scan");
  assert.equal(isLink(s.h.path(".cursor/skills/alpha")), false);
  assert.equal(exists(s.h.path(".agents/skills/alpha/SKILL.md")), true);
  assert.equal(s.channel.textAt(null), "Installing pdf…", "the other work keeps its lock");
  assert.equal(s.channel.textAt("vps"), "Installing pdf on vps…");
  assert.equal(s.channel.rev(null), 0);
  assert.equal(s.channel.rev("vps"), 0);
});

test("a failing operation says its error, releases the lock and bumps the revision", async () => {
  const s = setup({ files: { ...FIXTURE, ".cursor/skills/alpha/SKILL.md": SKILL("mine") } });
  await s.prime();
  await runRequest({ id: "1", op: "link", on: null, key: s.keyOf(".agents/skills/alpha"), tool: "cursor" }, s.deps);
  assert.deepEqual(notice(s.channel), { kind: "error", text: 'A different copy of "alpha" is already in Cursor' });
  assert.equal(isLink(s.h.path(".cursor/skills/alpha")), false);
  assert.equal(exists(s.h.path(".cursor/skills/alpha/SKILL.md")), true);
  assert.equal(s.channel.busyAt(null), false);
  assert.equal(s.channel.rev(null), 1);
  assert.deepEqual(s.scans.at(-1), { on: null, locked: false });
});

test("a warn result says it as a warning", async () => {
  const s = setup({ ops: { remove: async () => ({ ok: true, warn: "Deleted, but something was left" }) } });
  await s.prime("vps");
  await runRequest({ id: "1", op: "remove", on: "vps", key: s.keyOf(".agents/skills/alpha") }, s.deps);
  assert.deepEqual(notice(s.channel), { kind: "warn", text: "Deleted, but something was left" });
  assert.deepEqual(s.during.map((d) => d.busy), ["Deleting alpha on vps…"]);
  assert.equal(s.channel.busyAt("vps"), false);
  assert.equal(s.channel.rev("vps"), 1);
});

test("an operation that throws is reported, and the lock is released and the revision bumped", async () => {
  const s = setup({
    ops: {
      link: async () => {
        throw new Error("exec went away");
      },
    },
  });
  await s.prime();
  const result = await runRequest({ id: "1", op: "link", on: null, key: s.keyOf(".agents/skills/alpha"), tool: "cursor" }, s.deps);
  assert.deepEqual(result, { ok: false, error: "exec went away" });
  assert.deepEqual(notice(s.channel), { kind: "error", text: "exec went away" });
  assert.deepEqual(s.during.map((d) => d.busy), ["Adding alpha to Cursor…"]);
  assert.equal(s.channel.busyAt(null), false);
  assert.equal(s.channel.rev(null), 1);
  assert.deepEqual(s.scans.at(-1), { on: null, locked: false }, "the machine is read again after a failure too");
});

test("a re-scan that throws after the change still bumps and reports", async () => {
  const s = setup();
  await s.prime();
  let n = 0;
  const deps = { ...s.deps, scan: async (on) => (++n === 2 ? Promise.reject(new Error("gone")) : s.deps.scan(on)) };
  await runRequest({ id: "1", op: "link", on: null, key: s.keyOf(".agents/skills/alpha"), tool: "cursor" }, deps);
  assert.equal(isLink(s.h.path(".cursor/skills/alpha")), true);
  assert.deepEqual(notice(s.channel), { kind: "done", text: "Added alpha to Cursor" });
  assert.equal(s.channel.busyAt(null), false);
  assert.equal(s.channel.rev(null), 1);
});

test("a request with an unknown op or a malformed shape is refused without touching anything", async () => {
  const s = setup();
  const key = s.keyOf(".agents/skills/alpha");
  const bad = [
    null,
    "remove",
    { id: "1", op: "explode", on: null, key },
    { id: "3", op: "constructor", on: null, key },
    { id: "4", op: ["remove"], on: null, key },
    { id: "5", op: "remove", on: null },
    { id: "6", op: "remove", on: null, key: "" },
    { id: "7", op: "remove", on: null, key: 7 },
    { id: "8", op: "link", on: null, key },
    { id: "9", op: "unlink", on: null, key, tool: "" },
    { id: "10", op: "remove", on: "", key },
    { id: "11", op: "remove", on: 7, key },
    // install: a source, skill id or tool list that is malformed
    { id: "12", op: "install", on: null, skillId: "alpha", name: "alpha", tools: [] },
    { id: "13", op: "install", on: null, source: "a b/c", skillId: "alpha", name: "alpha", tools: [] },
    { id: "14", op: "install", on: null, source: "-x/y", skillId: "alpha", name: "alpha", tools: [] },
    { id: "15", op: "install", on: null, source: "acme/skills", name: "alpha", tools: [] },
    { id: "16", op: "install", on: null, source: "acme/skills", skillId: "../x", name: "x", tools: [] },
    { id: "17", op: "install", on: null, source: "acme/skills", skillId: "a;rm -rf ~", name: "x", tools: [] },
    { id: "18", op: "install", on: null, source: "acme/skills", skillId: "alpha", name: "alpha" },
    { id: "19", op: "install", on: null, source: "acme/skills", skillId: "alpha", name: "alpha", tools: "claude-code" },
    { id: "20", op: "install", on: null, source: "acme/skills", skillId: "alpha", name: "alpha", tools: [7] },
    { id: "21", op: "install", on: null, source: "acme/skills", skillId: "alpha", name: "alpha", tools: [""] },
    { id: "22", op: "install", on: "", source: "acme/skills", skillId: "alpha", name: "alpha", tools: [], replace: false },
    // install: what the dialog showed (replace) is missing or not a boolean
    { id: "23", op: "install", on: null, source: "acme/skills", skillId: "alpha", name: "alpha", tools: [] },
    { id: "24", op: "install", on: null, source: "acme/skills", skillId: "alpha", name: "alpha", tools: [], replace: "false" },
    { id: "25", op: "install", on: null, source: "acme/skills", skillId: "alpha", name: "alpha", tools: [], replace: null },
  ];
  for (const req of bad) {
    assert.equal(await runRequest(req, s.deps), null, JSON.stringify(req));
  }
  assert.deepEqual(s.calls, []);
  assert.deepEqual(s.scans, []);
  assert.deepEqual(s.claims, []);
  assert.deepEqual(s.touches, []);
  for (const k of [BUSY, NOTICE, REV]) assert.equal(s.store.has(k), false, k);
  assert.equal(exists(s.h.path(".agents/skills/alpha/SKILL.md")), true);
  assert.equal(isLink(s.h.path(".claude/skills/alpha")), true);
});

test("link, unlink and remove a folder with a quote and spaces", async () => {
  const s = setup();
  await s.prime();
  const key = s.keyOf(".agents/skills/it's odd name");
  await runRequest({ id: "1", op: "link", on: null, key, tool: "cursor" }, s.deps);
  assert.deepEqual(s.claims, [{ on: null, text: "Adding odd to Cursor…" }], "named as the panel saw it");
  assert.deepEqual(notice(s.channel), { kind: "done", text: "Added odd to Cursor" });
  assert.equal(fs.readlinkSync(s.h.path(".cursor/skills/it's odd name")), "../../.agents/skills/it's odd name");
  await runRequest({ id: "2", op: "unlink", on: null, key, tool: "cursor" }, s.deps);
  assert.deepEqual(notice(s.channel), { kind: "done", text: "Removed odd from Cursor" });
  assert.equal(isLink(s.h.path(".cursor/skills/it's odd name")), false);
  await runRequest({ id: "3", op: "remove", on: null, key }, s.deps);
  assert.deepEqual(notice(s.channel), { kind: "done", text: "Deleted odd" });
  assert.equal(exists(s.h.path(".agents/skills/it's odd name")), false);
  assert.equal(exists(s.h.path(".agents/skills/alpha/SKILL.md")), true);
});

test("remove acts on the skill the request names and no other", async () => {
  const s = setup();
  await s.prime();
  await runRequest({ id: "1", op: "remove", on: null, key: s.keyOf(".claude/skills/solo") }, s.deps);
  assert.deepEqual(notice(s.channel), { kind: "done", text: "Deleted solo" });
  assert.equal(exists(s.h.path(".claude/skills/solo")), false);
  for (const rel of [".agents/skills/alpha/SKILL.md", ".agents/skills/it's odd name/SKILL.md", ".claude/skills/group/nested/SKILL.md", "ext/outside/SKILL.md"]) {
    assert.equal(exists(s.h.path(rel)), true, rel);
  }
  assert.equal(isLink(s.h.path(".claude/skills/alpha")), true);
  assert.equal(isLink(s.h.path(".cursor/skills/outside")), true);
});

// ---- install (clones the local repository standing in for GitHub) ----

const withGit = { skip: hasGit ? false : "git is not installed on this computer" };
const lockEntry = (h, folder) => JSON.parse(fs.readFileSync(h.path(".agents/.skill-lock.json"), "utf8")).skills[folder];
const install = (skillId, extra = {}) => ({ id: "i", op: "install", on: null, source: "acme/skills", skillId, name: skillId, tools: [], replace: false, ...extra });

test("a first install says Installed, and the folder, links and lock entry exist", withGit, async () => {
  const s = setup({ files: {} });
  const result = await runRequest(install("alpha", { tools: ["claude-code", "cursor"] }), s.deps);
  assert.deepEqual(result, { ok: true, folder: "alpha" });
  assert.deepEqual(s.claims, [{ on: null, text: "Installing alpha…" }]);
  assert.deepEqual(s.during, [{ op: "install", on: null, busy: "Installing alpha…" }]);
  assert.deepEqual(notice(s.channel), { kind: "done", text: "Installed alpha" });
  assert.equal(fs.readFileSync(s.h.path(".agents/skills/alpha/extra.txt"), "utf8"), "extra");
  assert.equal(fs.readlinkSync(s.h.path(".claude/skills/alpha")), "../../.agents/skills/alpha");
  assert.equal(fs.readlinkSync(s.h.path(".cursor/skills/alpha")), "../../.agents/skills/alpha");
  const entry = lockEntry(s.h, "alpha");
  assert.deepEqual([entry.source, entry.sourceType], ["acme/skills", "github"]);
  assert.equal(s.channel.busyAt(null), false);
  assert.equal(s.channel.rev(null), 1);
  assert.deepEqual(s.scans, [
    { on: null, locked: true },
    { on: null, locked: false },
  ]);
});

test("a second install of the same skill says Updated", withGit, async () => {
  const s = setup({ files: {} });
  await runRequest(install("beta"), s.deps);
  assert.deepEqual(notice(s.channel), { kind: "done", text: "Installed beta" });
  await runRequest(install("beta", { replace: true }), s.deps);
  assert.deepEqual(notice(s.channel), { kind: "done", text: "Updated beta" });
  assert.deepEqual(s.claims.map((c) => c.text), ["Installing beta…", "Installing beta…"]);
  assert.equal(exists(s.h.path(".agents/skills/beta/SKILL.md")), true);
  assert.equal(s.channel.busyAt(null), false);
  assert.equal(s.channel.rev(null), 2);
});

test("Updated means the shared store had the folder; a folder inside one tool does not count", withGit, async () => {
  const s = setup(); // the fixture's shared store has alpha
  await runRequest(install("alpha", { name: "Alpha Skill", replace: true }), s.deps);
  assert.deepEqual(notice(s.channel), { kind: "done", text: "Updated Alpha Skill" });
  const t = setup({ files: { ".claude/skills/beta/SKILL.md": SKILL("mine") } });
  await runRequest(install("beta"), t.deps);
  assert.deepEqual(notice(t.channel), { kind: "done", text: "Installed beta" });
});

test("a named machine is named while installing and not when done; no name means the skill id", withGit, async () => {
  const s = setup({ files: {} });
  await runRequest(install("beta", { on: "vps", name: undefined }), s.deps);
  assert.deepEqual(s.claims, [{ on: "vps", text: "Installing beta on vps…" }]);
  assert.deepEqual(notice(s.channel), { kind: "done", text: "Installed beta" });
  assert.equal(s.channel.busyAt("vps"), false);
  assert.equal(s.channel.rev("vps"), 1);
  assert.equal(s.channel.rev(null), 0, "this computer's revision is left alone");
});

test("a skill the repo does not have says the not-found error and changes nothing", withGit, async () => {
  const s = setup();
  const before = fs.readdirSync(s.h.path(".agents/skills")).sort();
  const result = await runRequest(install("nope", { tools: ["cursor"] }), s.deps);
  assert.deepEqual(result, { ok: false, error: 'Could not find "nope" in acme/skills' });
  assert.deepEqual(notice(s.channel), { kind: "error", text: 'Could not find "nope" in acme/skills' });
  assert.deepEqual(fs.readdirSync(s.h.path(".agents/skills")).sort(), before);
  assert.equal(exists(s.h.path(".cursor/skills/nope")), false);
  assert.equal(exists(s.h.path(".agents/.skill-lock.json")), false);
  assert.equal(s.channel.busyAt(null), false);
  assert.equal(s.channel.rev(null), 1);
});

// The dialog showed Install or Update from its own scan; under the lock the
// fresh scan must agree, or nothing runs.
test("an install the dialog showed as new is refused when the skill appeared since, and nothing runs", withGit, async () => {
  const s = setup(); // the fixture's shared store has alpha, which the dialog did not see
  const before = fs.readdirSync(s.h.path(".agents/skills/alpha")).sort();
  assert.equal(await runRequest(install("alpha", { tools: ["cursor"] }), s.deps), null);
  assert.deepEqual(notice(s.channel), {
    kind: "error",
    text: "The shared store on this computer changed after the dialog was opened. Open alpha again.",
  });
  assert.deepEqual(s.during, [], "no install ran");
  assert.equal(s.calls.length, 1, "only the fresh scan ran on the machine");
  assert.deepEqual(fs.readdirSync(s.h.path(".agents/skills/alpha")).sort(), before);
  assert.equal(fs.readFileSync(s.h.path(".agents/skills/alpha/SKILL.md"), "utf8"), SKILL("alpha"));
  assert.equal(exists(s.h.path(".cursor/skills/alpha")), false);
  assert.equal(exists(s.h.path(".agents/.skill-lock.json")), false);
  assert.equal(s.channel.busyAt(null), false);
  assert.equal(s.channel.rev(null), 1, "an open dialog reads the store again");
});
test("an install the dialog showed as an update is refused when the skill is gone since, and nothing runs", withGit, async () => {
  const s = setup({ files: {} });
  assert.equal(await runRequest(install("beta", { on: "vps", name: "Beta", replace: true }), s.deps), null);
  assert.deepEqual(notice(s.channel), {
    kind: "error",
    text: "The shared store on vps changed after the dialog was opened. Open Beta again.",
  });
  assert.deepEqual(s.during, []);
  assert.equal(s.calls.length, 1);
  assert.equal(exists(s.h.path(".agents/skills/beta")), false);
  assert.equal(s.channel.busyAt("vps"), false);
});
test("an install over a folder that is not a shared-store skill is refused by the script and changes nothing", withGit, async () => {
  const files = { ".agents/skills/beta/notes.txt": "mine", ".agents/skills/beta/sub/SKILL.md": SKILL("sub") };
  const s = setup({ files });
  assert.deepEqual(await runRequest(install("beta"), s.deps), { ok: false, error: '"beta" already exists in the shared store on this computer and was not replaced' });
  assert.deepEqual(notice(s.channel), { kind: "error", text: '"beta" already exists in the shared store on this computer and was not replaced' });
  assert.equal(fs.readFileSync(s.h.path(".agents/skills/beta/notes.txt"), "utf8"), "mine");
  assert.equal(fs.readFileSync(s.h.path(".agents/skills/beta/sub/SKILL.md"), "utf8"), SKILL("sub"));
  assert.deepEqual(fs.readdirSync(s.h.path(".agents/skills")), ["beta"]);
});

test("an install's name is one plain line of at most 200 characters in the lock text and the notice", withGit, async () => {
  const s = setup({ files: {} });
  await runRequest(install("beta", { name: `Beta\n\u001b[2J  skill${"!".repeat(400)}` }), s.deps);
  const shown = `Beta [2J skill${"!".repeat(400)}`.slice(0, 200);
  assert.deepEqual(s.claims, [{ on: null, text: `Installing ${shown}…` }]);
  assert.deepEqual(notice(s.channel), { kind: "done", text: `Installed ${shown}` });
  // A name with nothing left in it is named by the skill id.
  await runRequest(install("alpha", { name: "\u0000\n\t " }), s.deps);
  assert.deepEqual(notice(s.channel), { kind: "done", text: "Installed alpha" });
});

test("an install whose lock file can't be rewritten says so as a warning", withGit, async () => {
  const s = setup({ files: { ".agents/.skill-lock.json": "{nope" } });
  const result = await runRequest(install("beta"), s.deps);
  assert.equal(result.ok, true);
  assert.deepEqual(notice(s.channel), { kind: "warn", text: "Installed, but the skill lock was not updated (invalid)" });
  assert.equal(fs.readFileSync(s.h.path(".agents/.skill-lock.json"), "utf8"), "{nope");
  assert.equal(exists(s.h.path(".agents/skills/beta/SKILL.md")), true);
  assert.equal(s.channel.busyAt(null), false);
  assert.equal(s.channel.rev(null), 1);
});

test("the lock is touched before each step, so a slow install never lets it go stale", withGit, async () => {
  // Every exec takes 100 s of the channel's clock (the scan, the copy, each
  // link, the lock write); a lock goes stale 150 s after its last touch.
  const clock = { now: 1_000_000 };
  const liveAtExec = [];
  const holder = {};
  holder.s = setup({
    files: {},
    clock,
    onExec: () => {
      liveAtExec.push(holder.s.channel.busyAt(null));
      clock.now += 100000;
    },
  });
  const { s } = holder;
  const result = await runRequest(install("alpha", { tools: ["claude-code", "cursor"] }), s.deps);
  assert.deepEqual(result, { ok: true, folder: "alpha" });
  // The fresh scan, the copy, two links and the lock write ran under a live
  // lock; the re-scan runs after the release.
  assert.deepEqual(liveAtExec, [true, true, true, true, true, false]);
  // After the fresh scan, before each link, before the lock read and its write.
  assert.deepEqual(s.touches, Array(5).fill({ on: null, live: true }));
  assert.deepEqual(notice(s.channel), { kind: "done", text: "Installed alpha" });
  assert.equal(s.channel.busyAt(null), false);
  assert.equal(s.channel.rev(null), 1);
});

test("an install that throws is reported, and the lock is released and the revision bumped", async () => {
  const s = setup({
    files: {},
    ops: {
      install: async () => {
        throw new Error("exec went away");
      },
    },
  });
  const result = await runRequest(install("alpha"), s.deps);
  assert.deepEqual(result, { ok: false, error: "exec went away" });
  assert.deepEqual(notice(s.channel), { kind: "error", text: "exec went away" });
  assert.equal(s.channel.busyAt(null), false);
  assert.equal(s.channel.rev(null), 1);
});

test("an install on a machine that can't be read runs nothing", async () => {
  const s = setup({ files: {} });
  const failing = { ...s.deps, scan: async () => ({ ok: false, error: "machine vps is unreachable" }) };
  assert.equal(await runRequest(install("alpha", { on: "vps", tools: ["cursor"] }), failing), null);
  assert.deepEqual(notice(s.channel), { kind: "error", text: "Can't check vps: machine vps is unreachable" });
  assert.deepEqual(s.claims, [{ on: "vps", text: "Installing alpha on vps…" }]);
  assert.deepEqual(s.during, []);
  assert.deepEqual(s.calls, []);
  assert.deepEqual(s.touches, []);
  assert.equal(s.channel.busyAt("vps"), false);
  assert.equal(s.channel.rev("vps"), 0);
  assert.equal(exists(s.h.path(".agents")), false);
});
