import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { BUSY, NOTICE, REV, createChannel } from "../skillsgate/mods/skillsgate/channel.js";
import { createMachine } from "../skillsgate/mods/skillsgate/machine.js";
import { runRequest } from "../skillsgate/mods/skillsgate/requests.js";
import { FIXTURE, SKILL, makeHome } from "./helpers.mjs";

// A temp home with real `sh`, a machine on it, a Map standing in for Herdr's
// shared store, and a scanOf that keeps the latest good scan per machine the
// way the panel does. `ops` replaces machine operations (to make one warn or
// throw). Every exec call, claim and scanOf call is recorded, and so is the
// lock text seen while an operation runs.
function setup({ files = FIXTURE, ops = {} } = {}) {
  const h = makeHome(files);
  const calls = [];
  const exec = (...args) => {
    calls.push(args);
    return h.exec(...args);
  };
  const real = createMachine({ exec, readText: h.readText });
  const store = new Map();
  const base = createChannel({ get: (key) => store.get(key), set: (key, value) => store.set(key, value) });
  const claims = [];
  const channel = {
    ...base,
    claim(on, text) {
      claims.push({ on, text });
      return base.claim(on, text);
    },
  };
  const during = []; // what the lock said while an operation ran
  const watched = (name) => async (on, ...rest) => {
    during.push({ op: name, on, busy: channel.textAt(on) });
    return (ops[name] ?? real[name])(on, ...rest);
  };
  const machine = { ...real, link: watched("link"), unlink: watched("unlink"), remove: watched("remove") };
  const latest = new Map();
  const scans = [];
  const scanOf = async (on, fresh) => {
    scans.push({ on, fresh: Boolean(fresh), locked: channel.busyAt(on) });
    const key = on ?? "";
    if (fresh || !latest.has(key)) {
      const r = await real.scan(on);
      if (r.ok) latest.set(key, { scan: r.scan, skills: r.skills });
      else if (!latest.has(key)) return { error: r.error };
    }
    return latest.get(key);
  };
  const deps = { channel, machine, scanOf };
  const keyOf = (rel) => fs.realpathSync(h.path(rel));
  return { h, calls, store, channel, claims, during, scans, deps, keyOf };
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

test("a named machine is named while running and not when done", async () => {
  const s = setup();
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

test("each run finds the skill in the latest scan and re-scans after releasing the lock", async () => {
  const s = setup();
  const key = s.keyOf(".agents/skills/alpha");
  await runRequest({ id: "1", op: "link", on: "vps", key, tool: "cursor" }, s.deps);
  assert.deepEqual(s.scans, [
    { on: "vps", fresh: false, locked: false },
    { on: "vps", fresh: true, locked: false },
  ]);
  // The second request sees what the first one's re-scan found.
  await runRequest({ id: "2", op: "unlink", on: "vps", key, tool: "cursor" }, s.deps);
  assert.equal(isLink(s.h.path(".cursor/skills/alpha")), false);
});

test("a busy machine gives the warning and changes nothing", async () => {
  const s = setup();
  s.channel.claim(null, "Installing pdf…");
  s.channel.claim("vps", "Installing pdf on vps…");
  s.claims.length = 0;
  const key = s.keyOf(".agents/skills/alpha");
  await runRequest({ id: "1", op: "link", on: null, key, tool: "cursor" }, s.deps);
  assert.deepEqual(notice(s.channel), { kind: "warn", text: "This computer is busy. Try again when it finishes." });
  await runRequest({ id: "2", op: "remove", on: "vps", key }, s.deps);
  assert.deepEqual(notice(s.channel), { kind: "warn", text: "vps is busy. Try again when it finishes." });
  assert.deepEqual(s.claims, []);
  assert.deepEqual(s.during, []);
  assert.deepEqual(s.calls, [], "nothing ran on the machine, not even a scan");
  assert.equal(isLink(s.h.path(".cursor/skills/alpha")), false);
  assert.equal(exists(s.h.path(".agents/skills/alpha/SKILL.md")), true);
  assert.equal(s.channel.textAt(null), "Installing pdf…", "the other work keeps its lock");
  assert.equal(s.channel.textAt("vps"), "Installing pdf on vps…");
  assert.equal(s.channel.rev(null), 0);
  assert.equal(s.channel.rev("vps"), 0);
});

test("a skill that is not in the latest scan is no longer on the machine", async () => {
  const s = setup();
  await runRequest({ id: "1", op: "remove", on: null, key: s.h.home + "/.agents/skills/gone" }, s.deps);
  assert.deepEqual(notice(s.channel), { kind: "error", text: "That skill is no longer on this computer." });
  await runRequest({ id: "2", op: "link", on: "vps", key: s.h.home + "/.agents/skills/gone", tool: "cursor" }, s.deps);
  assert.deepEqual(notice(s.channel), { kind: "error", text: "That skill is no longer on vps." });
  assert.deepEqual(s.claims, []);
  assert.deepEqual(s.during, []);
  assert.equal(s.channel.busyAt(null), false);
  // Only scans ran, and nothing on disk changed.
  assert.equal(s.calls.length, 2);
  assert.equal(exists(s.h.path(".agents/skills/alpha/SKILL.md")), true);
  // A dialog still showing it is told to read again.
  assert.equal(s.channel.rev(null), 1);
  assert.equal(s.channel.rev("vps"), 1);
});

test("a machine that can't be scanned says so and changes nothing", async () => {
  const s = setup();
  const deps = { ...s.deps, scanOf: async () => ({ error: "machine vps is unreachable" }) };
  await runRequest({ id: "1", op: "link", on: "vps", key: s.keyOf(".agents/skills/alpha"), tool: "cursor" }, deps);
  assert.deepEqual(notice(s.channel), { kind: "error", text: "Can't check vps: machine vps is unreachable" });
  const throwing = { ...s.deps, scanOf: async () => Promise.reject(new Error("sh: timeout")) };
  await runRequest({ id: "2", op: "remove", on: null, key: s.keyOf(".agents/skills/alpha") }, throwing);
  assert.deepEqual(notice(s.channel), { kind: "error", text: "Can't check this computer: sh: timeout" });
  assert.deepEqual(s.claims, []);
  assert.deepEqual(s.calls, []);
  assert.equal(s.channel.rev("vps"), 0);
  assert.equal(exists(s.h.path(".agents/skills/alpha/SKILL.md")), true);
});

test("a failing operation says its error, releases the lock and bumps the revision", async () => {
  const s = setup({ files: { ...FIXTURE, ".cursor/skills/alpha/SKILL.md": SKILL("mine") } });
  await runRequest({ id: "1", op: "link", on: null, key: s.keyOf(".agents/skills/alpha"), tool: "cursor" }, s.deps);
  assert.deepEqual(notice(s.channel), { kind: "error", text: 'A different copy of "alpha" is already in Cursor' });
  assert.equal(isLink(s.h.path(".cursor/skills/alpha")), false);
  assert.equal(exists(s.h.path(".cursor/skills/alpha/SKILL.md")), true);
  assert.equal(s.channel.busyAt(null), false);
  assert.equal(s.channel.rev(null), 1);
  assert.deepEqual(s.scans.at(-1), { on: null, fresh: true, locked: false });
});

test("a warn result says it as a warning", async () => {
  const s = setup({ ops: { remove: async () => ({ ok: true, warn: "Deleted, but something was left" }) } });
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
  const result = await runRequest({ id: "1", op: "link", on: null, key: s.keyOf(".agents/skills/alpha"), tool: "cursor" }, s.deps);
  assert.deepEqual(result, { ok: false, error: "exec went away" });
  assert.deepEqual(notice(s.channel), { kind: "error", text: "exec went away" });
  assert.deepEqual(s.during.map((d) => d.busy), ["Adding alpha to Cursor…"]);
  assert.equal(s.channel.busyAt(null), false);
  assert.equal(s.channel.rev(null), 1);
  assert.deepEqual(s.scans.at(-1), { on: null, fresh: true, locked: false }, "the machine is read again after a failure too");
});

test("a re-scan that throws after the change still bumps and reports", async () => {
  const s = setup();
  const base = s.deps.scanOf;
  const deps = { ...s.deps, scanOf: async (on, fresh) => (fresh ? Promise.reject(new Error("gone")) : base(on, fresh)) };
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
    { id: "2", op: "install", on: null, source: "a/b", skillId: "x", name: "x", tools: [] },
    { id: "3", op: "constructor", on: null, key },
    { id: "4", op: ["remove"], on: null, key },
    { id: "5", op: "remove", on: null },
    { id: "6", op: "remove", on: null, key: "" },
    { id: "7", op: "remove", on: null, key: 7 },
    { id: "8", op: "link", on: null, key },
    { id: "9", op: "unlink", on: null, key, tool: "" },
    { id: "10", op: "remove", on: "", key },
    { id: "11", op: "remove", on: 7, key },
  ];
  for (const req of bad) {
    assert.equal(await runRequest(req, s.deps), null, JSON.stringify(req));
  }
  assert.deepEqual(s.calls, []);
  assert.deepEqual(s.scans, []);
  assert.deepEqual(s.claims, []);
  for (const k of [BUSY, NOTICE, REV]) assert.equal(s.store.has(k), false, k);
  assert.equal(exists(s.h.path(".agents/skills/alpha/SKILL.md")), true);
  assert.equal(isLink(s.h.path(".claude/skills/alpha")), true);
});

test("link, unlink and remove a folder with a quote and spaces", async () => {
  const s = setup();
  const key = s.keyOf(".agents/skills/it's odd name");
  await runRequest({ id: "1", op: "link", on: null, key, tool: "cursor" }, s.deps);
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
  await runRequest({ id: "1", op: "remove", on: null, key: s.keyOf(".claude/skills/solo") }, s.deps);
  assert.deepEqual(notice(s.channel), { kind: "done", text: "Deleted solo" });
  assert.equal(exists(s.h.path(".claude/skills/solo")), false);
  for (const rel of [".agents/skills/alpha/SKILL.md", ".agents/skills/it's odd name/SKILL.md", ".claude/skills/group/nested/SKILL.md", "ext/outside/SKILL.md"]) {
    assert.equal(exists(s.h.path(rel)), true, rel);
  }
  assert.equal(isLink(s.h.path(".claude/skills/alpha")), true);
  assert.equal(isLink(s.h.path(".cursor/skills/outside")), true);
});
