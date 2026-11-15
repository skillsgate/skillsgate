import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { adaptExec, adaptReadText, createMachine } from "../skillsgate/mods/skillsgate/machine.js";
import { LINK, REMOVE, UNLINK } from "../skillsgate/mods/skillsgate/scripts.js";
import { FIXTURE, SKILL, makeHome } from "./helpers.mjs";

// A fresh home from the fixture, a machine whose `exec` calls are counted, and
// a first scan.
async function setup(files = FIXTURE) {
  const h = makeHome(files);
  const calls = [];
  const exec = (...args) => {
    calls.push(args);
    return h.exec(...args);
  };
  const m = createMachine({ exec, readText: h.readText });
  const r = await m.scan(null);
  assert.equal(r.ok, true);
  const skill = (name) => r.skills.find((s) => s.name === name);
  return { h, m, r, calls, skill };
}
const exists = (p) => fs.existsSync(p);
const isLink = (p) => {
  try {
    return fs.lstatSync(p).isSymbolicLink();
  } catch {
    return false;
  }
};

test("the exec adapter never rejects and drops Herdr's function name from the reason", async () => {
  const calls = [];
  const exec = adaptExec(async (program, args, options) => {
    calls.push([program, args, options]);
    if (options.on === "gone") throw new Error('`herdr.exec`: unknown machine "gone"');
    if (options.on === "odd") throw "plain text";
    return { code: 0, stdout: "out", stderr: "" };
  });
  assert.deepEqual(await exec("echo x", ["a"], null, 30000), { code: 0, stdout: "out", stderr: "" });
  assert.deepEqual(calls[0], ["sh", ["-c", "echo x", "skillsgate", "a"], { on: null, timeout: 30000 }]);
  assert.deepEqual(await exec("s", [], "gone", 1), { code: -1, stdout: "", stderr: 'unknown machine "gone"' });
  assert.deepEqual(await exec("s", [], "odd", 1), { code: -1, stdout: "", stderr: "plain text" });
});
test("the readText adapter keeps its contract and drops Herdr's function name from a rejection", async () => {
  const readText = adaptReadText(async (path, options) => {
    if (path === "/absent") return null;
    if (path === "/denied") throw new Error("`herdr.readTextFile`: permission denied");
    return `${path} on ${options.on}`;
  });
  assert.equal(await readText("/f", "vps"), "/f on vps");
  assert.equal(await readText("/absent", null), null);
  await assert.rejects(readText("/denied", null), (error) => error.message === "permission denied");
});
test("link adds a relative symlink", async () => {
  const { h, m, r, skill } = await setup();
  assert.deepEqual(await m.link(null, r.scan, skill("alpha"), "cursor"), { ok: true });
  assert.equal(fs.readlinkSync(h.path(".cursor/skills/alpha")), "../../.agents/skills/alpha");
  const again = await m.scan(null);
  assert.deepEqual(again.skills.find((s) => s.name === "alpha").tools, ["claude-code", "cursor", "universal"]);
});
test("link creates the tool's skills folder", async () => {
  const { h, m, r, skill } = await setup();
  assert.equal(exists(h.path(".windsurf")), false);
  assert.deepEqual(await m.link(null, r.scan, skill("alpha"), "windsurf"), { ok: true });
  assert.equal(isLink(h.path(".windsurf/skills/alpha")), true);
  assert.equal(exists(h.path(".windsurf/skills/alpha/SKILL.md")), true);
});
test("link replaces a stale symlink of the same name", async () => {
  const { h, m, r, skill } = await setup({ ...FIXTURE, ".cursor/skills/alpha": { link: "../nowhere" } });
  assert.deepEqual(await m.link(null, r.scan, skill("alpha"), "cursor"), { ok: true });
  assert.equal(fs.realpathSync(h.path(".cursor/skills/alpha")), fs.realpathSync(h.path(".agents/skills/alpha")));
});
test("link refuses when a real folder has the name", async () => {
  const { h, m, r, skill } = await setup({ ...FIXTURE, ".cursor/skills/alpha/SKILL.md": SKILL("mine") });
  assert.deepEqual(await m.link(null, r.scan, skill("alpha"), "cursor"), {
    ok: false,
    error: 'A different copy of "alpha" is already in Cursor',
  });
  assert.equal(exists(h.path(".cursor/skills/alpha/SKILL.md")), true);
  assert.equal(isLink(h.path(".cursor/skills/alpha")), false);
});
test("link refuses a skill outside the store", async () => {
  const { m, r, calls, skill } = await setup();
  const before = calls.length;
  assert.deepEqual(await m.link(null, r.scan, skill("solo"), "cursor"), {
    ok: false,
    error: "Only skills in the shared store can be added to other tools",
  });
  assert.equal(calls.length, before);
});
test("link refuses Universal and an unknown tool without running anything", async () => {
  const { m, r, calls, skill } = await setup();
  const before = calls.length;
  const u = await m.link(null, r.scan, skill("alpha"), "universal");
  assert.deepEqual(u, { ok: false, error: 'Universal holds the shared copy of "alpha". Delete the skill to remove it everywhere.' });
  assert.equal((await m.link(null, r.scan, skill("alpha"), "no-such-tool")).ok, false);
  assert.equal(calls.length, before);
});
test("link removes a link that does not resolve to a skill", async () => {
  const { h, m, r, skill } = await setup();
  // Run the script itself with a target that points at nothing.
  const bad = await h.exec(LINK, [h.path(".cursor/skills"), "alpha", "../../wrong/place", skill("alpha").real], null, 30000);
  assert.equal(bad.code, 5);
  assert.equal(isLink(h.path(".cursor/skills/alpha")), false);
  assert.equal(exists(h.path(".cursor/skills/alpha")), false);
  // The method reports the same exit as an error.
  const wrong = { ...skill("alpha"), real: h.path(".agents/skills/gone"), folder: "gone" };
  assert.deepEqual(await m.link(null, r.scan, wrong, "cursor"), { ok: false, error: 'Could not link "gone" into Cursor' });
  assert.equal(isLink(h.path(".cursor/skills/gone")), false);
});
test("link script refuses bad arguments", async () => {
  const { h, skill } = await setup();
  const dir = h.path(".cursor/skills");
  const real = skill("alpha").real;
  const cases = [
    ["", "alpha", "x", real],
    ["relative/dir", "alpha", "x", real],
    [dir, "", "x", real],
    [dir, "a/b", "x", real],
    [dir, "..", "x", real],
    [dir, "alpha", "", real],
    [dir, "alpha", "../../.agents/skills/alpha"], // no expected real path
    [dir, "alpha", "../../.agents/skills/alpha", ""],
    [dir, "alpha", "../../.agents/skills/alpha", "relative/alpha"],
  ];
  for (const args of cases) {
    assert.equal((await h.exec(LINK, args, null, 30000)).code, 2, JSON.stringify(args));
  }
  assert.deepEqual(fs.readdirSync(dir), ["outside"]);
});
test("link script refuses a link that leads to a different skill than the one asked for", async () => {
  const { h, skill } = await setup();
  const dir = h.path(".cursor/skills");
  // The target leads to "it's odd name", which holds a SKILL.md too.
  const r = await h.exec(LINK, [dir, "alpha", "../../.agents/skills/it's odd name", skill("alpha").real], null, 30000);
  assert.equal(r.code, 5);
  assert.equal(isLink(h.path(".cursor/skills/alpha")), false);
  assert.deepEqual(fs.readdirSync(dir), ["outside"]);
  // The right target with the same expectation links.
  assert.equal((await h.exec(LINK, [dir, "alpha", "../../.agents/skills/alpha", skill("alpha").real], null, 30000)).code, 0);
  assert.equal(fs.readlinkSync(h.path(".cursor/skills/alpha")), "../../.agents/skills/alpha");
});

test("unlink removes only the tool's link", async () => {
  const { h, m, skill } = await setup();
  assert.deepEqual(await m.unlink(null, skill("alpha"), "claude-code"), { ok: true });
  assert.equal(isLink(h.path(".claude/skills/alpha")), false);
  assert.equal(exists(h.path(".claude/skills/alpha")), false);
  assert.equal(exists(h.path(".agents/skills/alpha/SKILL.md")), true);
});
test("unlink refuses when the link became a real folder", async () => {
  const { h, m, skill } = await setup();
  fs.rmSync(h.path(".claude/skills/alpha"));
  fs.mkdirSync(h.path(".claude/skills/alpha"));
  fs.writeFileSync(h.path(".claude/skills/alpha/SKILL.md"), SKILL("other"));
  assert.deepEqual(await m.unlink(null, skill("alpha"), "claude-code"), {
    ok: false,
    error: '"alpha" changed on disk. Refresh and try again.',
  });
  assert.equal(exists(h.path(".claude/skills/alpha/SKILL.md")), true);
});
test("unlink refuses when the link now points somewhere else", async () => {
  const { h, m, skill } = await setup();
  fs.rmSync(h.path(".claude/skills/alpha"));
  fs.symlinkSync("../../ext/outside", h.path(".claude/skills/alpha"));
  const r = await m.unlink(null, skill("alpha"), "claude-code");
  assert.deepEqual(r, { ok: false, error: '"alpha" changed on disk. Refresh and try again.' });
  assert.equal(isLink(h.path(".claude/skills/alpha")), true);
});
test("unlink refuses a dangling link", async () => {
  const { h, m, skill } = await setup();
  fs.rmSync(h.path(".claude/skills/alpha"));
  fs.symlinkSync("../nowhere", h.path(".claude/skills/alpha"));
  assert.equal((await m.unlink(null, skill("alpha"), "claude-code")).ok, false);
  assert.equal(isLink(h.path(".claude/skills/alpha")), true);
});
test("unlink refuses Universal", async () => {
  const { m, calls, skill } = await setup();
  const before = calls.length;
  assert.deepEqual(await m.unlink(null, skill("alpha"), "universal"), {
    ok: false,
    error: 'Universal holds the shared copy of "alpha". Delete the skill to remove it everywhere.',
  });
  assert.equal(calls.length, before);
});
test("unlink refuses a tool's own copy and treats a missing entry as done", async () => {
  const { h, m, calls, skill } = await setup();
  const before = calls.length;
  assert.deepEqual(await m.unlink(null, skill("solo"), "claude-code"), {
    ok: false,
    error: 'Claude Code holds its own copy of "solo". Delete the skill to remove it.',
  });
  assert.equal(exists(h.path(".claude/skills/solo/SKILL.md")), true);
  assert.deepEqual(await m.unlink(null, skill("alpha"), "cursor"), { ok: true });
  assert.equal(calls.length, before);
});
test("unlink script is a no-op for a path that is gone", async () => {
  const { h } = await setup();
  const r = await h.exec(UNLINK, [`${h.home}/.cursor/skills/nothing`, `${h.home}/.agents/skills/alpha`], null, 30000);
  assert.equal(r.code, 0);
});
test("unlink script refuses empty or relative arguments", async () => {
  const { h } = await setup();
  const link = `${h.home}/.claude/skills/alpha`;
  const real = `${h.home}/.agents/skills/alpha`;
  for (const args of [["", real], [link, ""], ["relative", real], [link, "relative"]]) {
    assert.equal((await h.exec(UNLINK, args, null, 30000)).code, 2, JSON.stringify(args));
  }
  assert.equal(isLink(link), true);
});

test("remove deletes a store skill and its links", async () => {
  const { h, m, r, skill } = await setup();
  assert.deepEqual(await m.remove(null, r.scan, skill("alpha")), { ok: true });
  assert.equal(exists(h.path(".agents/skills/alpha")), false);
  assert.equal(isLink(h.path(".claude/skills/alpha")), false);
  assert.equal(exists(h.path(".agents/skills/it's odd name/SKILL.md")), true);
  assert.equal(exists(h.path(".claude/skills/solo/SKILL.md")), true);
});
test("remove deletes a tool's own copy", async () => {
  const { h, m, r, skill } = await setup();
  assert.deepEqual(await m.remove(null, r.scan, skill("solo")), { ok: true });
  assert.equal(exists(h.path(".claude/skills/solo")), false);
  assert.equal(exists(h.path(".claude/skills")), true);
  assert.equal(exists(h.path(".agents/skills/alpha/SKILL.md")), true);
});
test("remove deletes a skill in a grouping folder and nothing else", async () => {
  const { h, m, r, skill } = await setup();
  assert.deepEqual(await m.remove(null, r.scan, skill("nested")), { ok: true });
  assert.equal(exists(h.path(".claude/skills/group/nested")), false);
  assert.equal(exists(h.path(".claude/skills/solo/SKILL.md")), true);
});
test("remove keeps a folder linked from elsewhere", async () => {
  const { h, m, r, skill } = await setup();
  assert.deepEqual(await m.remove(null, r.scan, skill("outside")), { ok: true });
  assert.equal(isLink(h.path(".cursor/skills/outside")), false);
  assert.equal(exists(h.path(".cursor/skills/outside")), false);
  assert.equal(exists(h.path("ext/outside/SKILL.md")), true);
});
test("remove of a skill linked from elsewhere refuses when no link to it was removed", async () => {
  // Reached through a tool's grouping folder that is a link: the skill's own
  // entry is not a link, so there is nothing the mod can remove.
  const { h, m, r, skill } = await setup({ "ext/pack/foo/SKILL.md": SKILL("foo"), ".claude/skills/pack": { link: "../../ext/pack" } });
  const foo = skill("foo");
  assert.equal(foo.home, "external");
  assert.deepEqual(await m.remove(null, r.scan, foo), { ok: false, error: '"foo" changed on disk. Refresh and try again.' });
  assert.equal(exists(h.path("ext/pack/foo/SKILL.md")), true);
  assert.equal(isLink(h.path(".claude/skills/pack")), true);
  // Its links already gone since the scan: the same refusal.
  const t = await setup();
  fs.rmSync(t.h.path(".cursor/skills/outside"));
  assert.deepEqual(await t.m.remove(null, t.r.scan, t.skill("outside")), { ok: false, error: '"outside" changed on disk. Refresh and try again.' });
  assert.equal(exists(t.h.path("ext/outside/SKILL.md")), true);
});
test("remove refuses when SKILL.md is gone", async () => {
  const { h, m, r, skill } = await setup();
  fs.rmSync(h.path(".agents/skills/alpha/SKILL.md"));
  assert.deepEqual(await m.remove(null, r.scan, skill("alpha")), {
    ok: false,
    error: '"alpha" changed on disk. Refresh and try again.',
  });
  assert.equal(isLink(h.path(".claude/skills/alpha")), true);
  assert.equal(exists(h.path(".agents/skills/alpha")), true);
});
test("remove refuses when the folder was swapped for a link to somewhere else", async () => {
  const { h, m, r, skill } = await setup();
  fs.rmSync(h.path(".claude/skills/solo"), { recursive: true });
  fs.symlinkSync("../../ext/outside", h.path(".claude/skills/solo"));
  const res = await m.remove(null, r.scan, skill("solo"));
  assert.deepEqual(res, { ok: false, error: '"solo" changed on disk. Refresh and try again.' });
  assert.equal(exists(h.path("ext/outside/SKILL.md")), true);
  assert.equal(isLink(h.path(".claude/skills/solo")), true);
});
test("remove script refuses an empty, relative or outside path and changes nothing", async () => {
  const { h } = await setup();
  const at = (rel) => `${h.home}/${rel}`; // h.home is a real path, as the scan reports
  const base = at(".claude/skills");
  const link = at(".claude/skills/alpha");
  const cases = [
    [["", base, link], 2],
    [["", "", link], 2],
    [[".agents/skills/alpha", base, link], 2], // relative
    [[at(".agents/skills/alpha"), "relative/base", link], 2],
    [[at(".agents/skills/alpha"), base, link], 4], // inside another folder than the base
    [[base, base, link], 4], // the base itself
    [[at(".claude/skills/group/../solo"), base, link], 4], // not a real path
    [[at("ext/outside"), base, link], 4],
    [[at(".claude/skills/broken"), base, link], 4], // a dangling link
    [[at(".claude/skills/notes"), base, link], 4], // no SKILL.md
    [[at(".claude/skills/alpha"), base, link], 4], // a link, not a real folder
  ];
  for (const [args, code] of cases) {
    const r = await h.exec(REMOVE, args, null, 30000);
    assert.equal(r.code, code, JSON.stringify(args));
  }
  assert.equal(isLink(link), true);
  assert.equal(exists(at(".agents/skills/alpha/SKILL.md")), true);
  assert.equal(exists(at("ext/outside/SKILL.md")), true);
  assert.equal(exists(at(".claude/skills/solo/SKILL.md")), true);
  assert.equal(exists(at(".claude/skills/notes/readme.txt")), true);
});
test("remove script leaves a link that points elsewhere", async () => {
  const { h } = await setup();
  const at = (rel) => `${h.home}/${rel}`;
  const r = await h.exec(REMOVE, [at("ext/outside"), "-", at(".claude/skills/alpha"), at(".cursor/skills/outside")], null, 30000);
  assert.equal(r.code, 0);
  assert.equal(isLink(h.path(".claude/skills/alpha")), true);
  assert.equal(isLink(h.path(".cursor/skills/outside")), false);
  assert.equal(exists(h.path("ext/outside/SKILL.md")), true);
});
test("remove script refuses an empty second argument and changes nothing", async () => {
  const { h } = await setup();
  const at = (rel) => `${h.home}/${rel}`;
  const r = await h.exec(REMOVE, [at("ext/outside"), "", at(".cursor/skills/outside")], null, 30000);
  assert.notEqual(r.code, 0);
  assert.equal(isLink(at(".cursor/skills/outside")), true);
  assert.equal(exists(at("ext/outside/SKILL.md")), true);
});
test("remove script refuses arguments shifted as if an empty base had been dropped", async () => {
  const { h } = await setup();
  const at = (rel) => `${h.home}/${rel}`;
  // $1 = the external skill, $2 = a link that leads to it.
  const r = await h.exec(REMOVE, [at("ext/outside"), at(".cursor/skills/outside")], null, 30000);
  assert.notEqual(r.code, 0);
  assert.equal(isLink(at(".cursor/skills/outside")), true);
  assert.equal(exists(at("ext/outside/SKILL.md")), true);
});
test("remove script refuses a base that is a link to the parent of the target", async () => {
  const { h } = await setup();
  const at = (rel) => `${h.home}/${rel}`;
  fs.rmSync(at(".cursor/skills/outside"));
  fs.symlinkSync("../../ext", at(".cursor/skills/outside")); // now leads to the parent of ext/outside
  const r = await h.exec(REMOVE, [at("ext/outside"), at(".cursor/skills/outside")], null, 30000);
  assert.notEqual(r.code, 0);
  assert.equal(isLink(at(".cursor/skills/outside")), true);
  assert.equal(exists(at("ext/outside/SKILL.md")), true);
  // The same refusal when the link is passed as the base alongside entries.
  const again = await h.exec(REMOVE, [at("ext/outside"), at(".cursor/skills/outside"), at(".cursor/skills/outside")], null, 30000);
  assert.notEqual(again.code, 0);
  assert.equal(exists(at("ext/outside/SKILL.md")), true);
});
test("remove script handles a name that starts with a dash and holds a newline", async () => {
  const h = makeHome({ ".agents/skills/-dash/SKILL.md": SKILL("dash"), ".agents/skills/two\nlines/SKILL.md": SKILL("two") });
  const base = fs.realpathSync(h.path(".agents/skills"));
  assert.equal((await h.exec(REMOVE, [`${base}/-dash`, base], null, 30000)).code, 0);
  assert.equal((await h.exec(REMOVE, [`${base}/two\nlines`, base], null, 30000)).code, 0);
  assert.deepEqual(fs.readdirSync(base), []);
});

test("link, unlink and remove work on a folder with a quote and spaces", async () => {
  const { h, m, r, skill } = await setup();
  const odd = skill("odd");
  assert.equal(odd.folder, "it's odd name");
  assert.deepEqual(await m.link(null, r.scan, odd, "cursor"), { ok: true });
  assert.equal(fs.readlinkSync(h.path(".cursor/skills/it's odd name")), "../../.agents/skills/it's odd name");
  assert.deepEqual(await m.link(null, r.scan, odd, "claude-code"), { ok: true });
  const s2 = await m.scan(null);
  const odd2 = s2.skills.find((s) => s.name === "odd");
  assert.deepEqual(odd2.tools, ["claude-code", "cursor", "universal"]);
  assert.deepEqual(await m.unlink(null, odd2, "cursor"), { ok: true });
  assert.equal(isLink(h.path(".cursor/skills/it's odd name")), false);
  assert.equal(exists(h.path(".agents/skills/it's odd name/SKILL.md")), true);
  assert.deepEqual(await m.remove(null, s2.scan, odd2), { ok: true });
  assert.equal(exists(h.path(".agents/skills/it's odd name")), false);
  assert.equal(isLink(h.path(".claude/skills/it's odd name")), false);
  assert.equal(exists(h.path(".agents/skills/alpha/SKILL.md")), true);
});
