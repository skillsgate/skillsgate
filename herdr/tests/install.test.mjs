import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import { execFile, execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createMachine } from "../skillsgate/mods/skillsgate/machine.js";
import { INSTALL, LINK, WRITE } from "../skillsgate/mods/skillsgate/scripts.js";
import { SKILL, makeHome } from "./helpers.mjs";

const hasGit = spawnSync("git", ["--version"]).status === 0;
const NOW = "2026-11-15T10:00:00.000Z";

describe("install", { skip: hasGit ? false : "git is not installed on this computer" }, () => {
  let root;
  let repo;
  let gitHome;

  // Builds a repo from `{ "relative/path": "text" | { link: target } }` (a name
  // may hold newlines) with an environment that never reads the maintainer's own
  // git configuration.
  let repoCount = 0;
  function buildRepo(files) {
    const dir = path.join(root, `repo-${++repoCount}`);
    for (const [rel, value] of Object.entries(files)) {
      fs.mkdirSync(path.dirname(path.join(dir, rel)), { recursive: true });
      if (typeof value === "string") fs.writeFileSync(path.join(dir, rel), value);
      else fs.symlinkSync(value.link, path.join(dir, rel));
    }
    const env = { PATH: process.env.PATH, HOME: gitHome, GIT_CONFIG_NOSYSTEM: "1" };
    const git = (...args) => execFileSync("git", args, { cwd: dir, env, stdio: "pipe" });
    git("init", "-q", "-b", "main");
    git("add", "-A");
    git("-c", "user.name=t", "-c", "user.email=t@t", "-c", "commit.gpgsign=false", "commit", "-q", "-m", "init");
    return dir;
  }

  // A fixture repo built with an environment that never reads the maintainer's
  // own git configuration.
  before(() => {
    root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "sg repo.")));
    repo = path.join(root, "acme skills");
    gitHome = path.join(root, "git-home");
    fs.mkdirSync(gitHome);
    const put = (rel, text) => {
      fs.mkdirSync(path.dirname(path.join(repo, rel)), { recursive: true });
      fs.writeFileSync(path.join(repo, rel), text);
    };
    fs.mkdirSync(repo);
    put("skills/alpha/SKILL.md", SKILL("alpha"));
    put("skills/alpha/extra.txt", "extra");
    put("beta/SKILL.md", SKILL("beta"));
    put("weird/dir/SKILL.md", SKILL("gamma"));
    fs.symlinkSync("../beta", path.join(repo, "skills/linked"));
    const env = { PATH: process.env.PATH, HOME: gitHome, GIT_CONFIG_NOSYSTEM: "1" };
    const git = (...args) => execFileSync("git", args, { cwd: repo, env, stdio: "pipe" });
    git("init", "-q", "-b", "main");
    git("add", "-A");
    git("-c", "user.name=t", "-c", "user.email=t@t", "-c", "commit.gpgsign=false", "commit", "-q", "-m", "init");
  });
  after(() => fs.rmSync(root, { recursive: true, force: true }));

  const SOURCE = "acme/skills";
  const sources = (url) => ({ cloneUrl: () => url ?? "file://" + repo, now: () => NOW });

  // A home, a machine whose `exec` calls are counted, and a first scan.
  async function setup(files = {}, options = {}) {
    const h = makeHome(files);
    const calls = [];
    const exec = (...args) => {
      calls.push(args);
      return h.exec(...args);
    };
    const m = createMachine({ exec, readText: h.readText, ...sources(options.url) });
    const r = await m.scan(null);
    assert.equal(r.ok, true);
    const tmp = (await h.exec('printf %s "$TMPDIR"')).stdout;
    const leftovers = () => fs.readdirSync(tmp).filter((n) => n.startsWith("skillsgate-herdr."));
    return { h, m, r, calls, tmp, leftovers };
  }
  const read = (p) => fs.readFileSync(p, "utf8");
  const exists = (p) => fs.existsSync(p);
  const isLink = (p) => {
    try {
      return fs.lstatSync(p).isSymbolicLink();
    } catch {
      return false;
    }
  };
  const lockOf = (h) => JSON.parse(read(h.path(".agents/.skill-lock.json")));
  // `replace` is what the dialog showed: Update (true) or Install (false).
  const installed = (id, tools = [], replace = false) => ({ source: SOURCE, skillId: id, tools, replace });
  const updated = (id, tools = []) => installed(id, tools, true);
  // Every entry under `dir`, in order: its path and its text, its link target, or "dir".
  const snapshot = (dir) => {
    const out = [];
    const into = (rel) => {
      for (const name of fs.readdirSync(path.join(dir, rel)).sort()) {
        const r = path.join(rel, name);
        const st = fs.lstatSync(path.join(dir, r));
        if (st.isSymbolicLink()) out.push([r, "link", fs.readlinkSync(path.join(dir, r))]);
        else if (st.isDirectory()) {
          out.push([r, "dir"]);
          into(r);
        } else out.push([r, "file", fs.readFileSync(path.join(dir, r), "utf8")]);
      }
    };
    into("");
    return out;
  };
  const NOT_REPLACED = (folder, where = "this computer") => ({
    ok: false,
    error: `"${folder}" already exists in the shared store on ${where} and was not replaced`,
  });
  // Whether the disk under `dir` ignores case (macOS by default).
  const ignoresCase = (dir) => {
    fs.writeFileSync(path.join(dir, "CaseProbe"), "");
    const ignores = fs.existsSync(path.join(dir, "caseprobe"));
    fs.rmSync(path.join(dir, "CaseProbe"));
    return ignores;
  };

  it("install copies the skill, links it and records the source", async () => {
    const { h, m, r, leftovers } = await setup();
    assert.deepEqual(await m.install(null, r.scan, installed("alpha", ["claude-code"])), { ok: true, folder: "alpha" });
    assert.equal(exists(h.path(".agents/skills/alpha/SKILL.md")), true);
    assert.equal(read(h.path(".agents/skills/alpha/extra.txt")), "extra");
    assert.equal(exists(h.path(".agents/skills/alpha/.git")), false);
    assert.equal(isLink(h.path(".claude/skills/alpha")), true);
    assert.equal(exists(h.path(".claude/skills/alpha/SKILL.md")), true);
    assert.equal(lockOf(h).skills.alpha.source, SOURCE);
    assert.deepEqual(Object.keys(lockOf(h).skills.alpha), ["source", "sourceType", "originalUrl", "skillFolderHash", "installedAt", "updatedAt"]);
    assert.equal(read(h.path(".agents/.skill-lock.json")), JSON.stringify(lockOf(h), null, 2));
    assert.deepEqual(leftovers(), []);
    assert.deepEqual(fs.readdirSync(h.path(".agents/skills")), ["alpha"]);
    assert.deepEqual(fs.readdirSync(h.path(".agents")).sort(), [".skill-lock.json", "skills"]);
  });
  it("install finds a skill at the repo's top level", async () => {
    const { h, m, r } = await setup();
    assert.deepEqual(await m.install(null, r.scan, installed("beta")), { ok: true, folder: "beta" });
    assert.equal(exists(h.path(".agents/skills/beta/SKILL.md")), true);
  });
  it("install finds a skill by its frontmatter name", async () => {
    const { h, m, r } = await setup();
    assert.deepEqual(await m.install(null, r.scan, installed("gamma")), { ok: true, folder: "gamma" });
    assert.equal(exists(h.path(".agents/skills/gamma/SKILL.md")), true);
    assert.equal(lockOf(h).skills.gamma.source, SOURCE);
  });
  const walk = (dir) =>
    fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => [e.name, ...(e.isDirectory() ? walk(path.join(dir, e.name)) : [])]);
  const fromRepo = (dir) => ({ url: "file://" + dir });

  // Folder names with newlines make `find` print `../..` as a line of its own.
  const HOSTILE = "a\n../..\nb/alpha/SKILL.md";
  async function hostileInstall(files) {
    const s = await setup({ ".agents/skills/other/SKILL.md": SKILL("other") }, fromRepo(buildRepo({ [HOSTILE]: SKILL("alpha"), ...files })));
    // Outside the clone: a SKILL.md and a private file in TMPDIR itself.
    fs.writeFileSync(path.join(s.tmp, "SKILL.md"), SKILL("planted"));
    fs.writeFileSync(path.join(s.tmp, "private.txt"), "private");
    const result = await s.m.install(null, s.r.scan, installed("alpha"));
    const inStore = walk(s.h.path(".agents/skills"));
    assert.equal(inStore.includes("private.txt"), false);
    assert.equal(inStore.some((n) => n.startsWith("skillsgate-herdr.")), false);
    assert.deepEqual(s.leftovers(), []);
    return { ...s, result };
  }
  it("install never copies from outside the clone when a path with newlines points there", async () => {
    const { h, result } = await hostileInstall({});
    assert.deepEqual(result, { ok: false, error: 'Could not find "alpha" in acme/skills' });
    assert.deepEqual(fs.readdirSync(h.path(".agents/skills")), ["other"]);
    assert.equal(exists(h.path(".agents/.skill-lock.json")), false);
  });
  it("install takes the real skill from a repo that also holds a path with newlines", async () => {
    const { h, result } = await hostileInstall({ "legit/deep/alpha/SKILL.md": SKILL("alpha"), "legit/deep/alpha/mine.txt": "mine" });
    assert.deepEqual(result, { ok: true, folder: "alpha" });
    assert.equal(read(h.path(".agents/skills/alpha/mine.txt")), "mine");
    assert.deepEqual(fs.readdirSync(h.path(".agents/skills")).sort(), ["alpha", "other"]);
  });
  it("install tries skills/.curated and skills/.experimental", async () => {
    const dir = buildRepo({
      "skills/.curated/cur/SKILL.md": SKILL("cur"),
      "skills/.curated/cur/c.txt": "c",
      "skills/.experimental/exp/SKILL.md": SKILL("exp"),
      "skills/.experimental/exp/e.txt": "e",
    });
    const { h, m, r } = await setup({}, fromRepo(dir));
    assert.deepEqual(await m.install(null, r.scan, installed("cur")), { ok: true, folder: "cur" });
    assert.deepEqual(await m.install(null, r.scan, installed("exp")), { ok: true, folder: "exp" });
    assert.equal(read(h.path(".agents/skills/cur/c.txt")), "c");
    assert.equal(read(h.path(".agents/skills/exp/e.txt")), "e");
  });
  it("install finds <dir>/<id>/SKILL.md even when its frontmatter name differs", async () => {
    const dir = buildRepo({ "deep/dir/delta/SKILL.md": SKILL("not-delta"), "deep/dir/delta/d.txt": "d" });
    const { h, m, r } = await setup({}, fromRepo(dir));
    assert.deepEqual(await m.install(null, r.scan, installed("delta")), { ok: true, folder: "delta" });
    assert.equal(read(h.path(".agents/skills/delta/d.txt")), "d");
  });
  it("install prefers a skill in the repo over the repo's root SKILL.md", async () => {
    const dir = buildRepo({
      "SKILL.md": SKILL("rootskill"),
      "ROOT_MARKER.txt": "root",
      "plugins/x/skills/pdf/SKILL.md": SKILL("pdf"),
      "plugins/x/skills/pdf/nested.txt": "nested",
    });
    const { h, m, r } = await setup({}, fromRepo(dir));
    assert.deepEqual(await m.install(null, r.scan, installed("pdf")), { ok: true, folder: "pdf" });
    assert.equal(read(h.path(".agents/skills/pdf/nested.txt")), "nested");
    assert.equal(exists(h.path(".agents/skills/pdf/ROOT_MARKER.txt")), false);
  });
  it("install falls back to the repo's root SKILL.md in a single-skill repo", async () => {
    const dir = buildRepo({ "SKILL.md": SKILL("rootskill"), "ROOT_MARKER.txt": "root" });
    const { h, m, r } = await setup({}, fromRepo(dir));
    assert.deepEqual(await m.install(null, r.scan, installed("whatever")), { ok: true, folder: "whatever" });
    assert.equal(read(h.path(".agents/skills/whatever/ROOT_MARKER.txt")), "root");
    assert.equal(exists(h.path(".agents/skills/whatever/.git")), false);
  });
  const NOT_FOUND = (id) => ({ ok: false, error: `Could not find "${id}" in acme/skills` });
  // A store with one skill, and the repo built from `files`.
  const withRepo = (files) => setup({ ".agents/skills/other/SKILL.md": SKILL("other") }, fromRepo(buildRepo(files)));
  const storeUnchanged = (h) => {
    assert.deepEqual(fs.readdirSync(h.path(".agents/skills")), ["other"]);
    assert.equal(exists(h.path(".agents/.skill-lock.json")), false);
  };
  // A file outside every clone, and the layout that makes `find` print the line
  // `./P/SKILL.md` for a real file named `z\n./P/SKILL.md`.
  const outsideFile = (name, text) => {
    const file = path.join(root, name);
    fs.writeFileSync(file, text);
    return file;
  };
  it("install ignores a SKILL.md that is a symlink to a file outside the clone", async () => {
    const outside = outsideFile("outside-nope.md", "---\nname: nope\n---\n");
    const { h, m, r, leftovers } = await withRepo({ "z\n./P/SKILL.md": SKILL("z"), "P/SKILL.md": { link: outside } });
    assert.deepEqual(await m.install(null, r.scan, installed("nope")), NOT_FOUND("nope"));
    storeUnchanged(h);
    assert.deepEqual(leftovers(), []);
  });
  it("install does not read a SKILL.md that is a symlink to /dev/zero, so it returns promptly", async () => {
    const dir = buildRepo({ "z\n./P/SKILL.md": SKILL("z"), "P/SKILL.md": { link: "/dev/zero" } });
    const { h, r } = await setup({ ".agents/skills/other/SKILL.md": SKILL("other") }, fromRepo(dir));
    // A machine whose scripts are killed after 15 seconds; a hang would fail the
    // result, and the check below fails it after 10.
    const m = createMachine({ exec: (script, args, on) => h.exec(script, args, on, 15000), readText: h.readText, ...sources("file://" + dir) });
    const started = Date.now();
    assert.deepEqual(await m.install(null, r.scan, installed("nope")), NOT_FOUND("nope"));
    assert.ok(Date.now() - started < 10000, "the install took too long");
    storeUnchanged(h);
  });
  it("install does not accept a folder whose real name ends in a newline", async () => {
    // skills/alpha leads to the real folder `..\n` at the clone's root; command
    // substitution would turn its path into `<clone>/..`.
    const { h, m, r, leftovers } = await withRepo({
      "skills/alpha": { link: "../..\n" },
      "..\n/SKILL.md": SKILL("alpha"),
      "..\n/inner.txt": "inner",
    });
    assert.deepEqual(await m.install(null, r.scan, installed("alpha")), NOT_FOUND("alpha"));
    storeUnchanged(h);
    assert.deepEqual(leftovers(), []);
  });
  it("install does not count a SKILL.md that is a symlink, even to a file inside the clone", async () => {
    const { h, m, r } = await withRepo({
      "decoy.md": SKILL("alpha"),
      "skills/.curated/alpha/SKILL.md": { link: "../../../decoy.md" },
      "skills/.curated/alpha/readme.txt": "readme",
    });
    assert.deepEqual(await m.install(null, r.scan, installed("alpha")), NOT_FOUND("alpha"));
    storeUnchanged(h);
  });
  it("install refuses a skill that holds a symlink and leaves an installed copy as it was", async () => {
    const base = { "secret.txt": "secret", "skills/alpha/SKILL.md": SKILL("alpha"), "skills/alpha/fine.txt": "fine" };
    const variants = {
      "a link at the top and one nested deeper": { ...base, "skills/alpha/notes": { link: "../../secret.txt" }, "skills/alpha/deep/er/more": { link: "../../../../secret.txt" } },
      "only a link nested deeper": { ...base, "skills/alpha/deep/er/more": { link: "../../../../secret.txt" } },
    };
    for (const [label, files] of Object.entries(variants)) {
      const s = await setup({ ".agents/skills/alpha/SKILL.md": SKILL("old"), ".agents/skills/alpha/old.txt": "old" }, fromRepo(buildRepo(files)));
      assert.deepEqual(
        await s.m.install(null, s.r.scan, updated("alpha")),
        { ok: false, error: '"alpha" in acme/skills contains symbolic links and was not installed' },
        label,
      );
      assert.equal(read(s.h.path(".agents/skills/alpha/SKILL.md")), SKILL("old"), label);
      assert.equal(read(s.h.path(".agents/skills/alpha/old.txt")), "old", label);
      assert.deepEqual(fs.readdirSync(s.h.path(".agents/skills")), ["alpha"], label); // no staging folder
      assert.deepEqual(s.leftovers(), [], label);
      assert.equal(exists(s.h.path(".agents/.skill-lock.json")), false, label);
    }
  });
  it("install copies a skill folder that is a symlink in the repo as a real folder", async () => {
    const { h, m, r } = await setup();
    assert.deepEqual(await m.install(null, r.scan, installed("linked")), { ok: true, folder: "linked" });
    assert.equal(isLink(h.path(".agents/skills/linked")), false);
    assert.equal(fs.statSync(h.path(".agents/skills/linked")).isDirectory(), true);
    assert.equal(exists(h.path(".agents/skills/linked/SKILL.md")), true);
  });
  it("install reports a skill the repo doesn't have", async () => {
    const { h, m, r, leftovers } = await setup({ ".agents/skills/other/SKILL.md": SKILL("other") });
    assert.deepEqual(await m.install(null, r.scan, installed("nope")), { ok: false, error: 'Could not find "nope" in acme/skills' });
    assert.deepEqual(fs.readdirSync(h.path(".agents/skills")), ["other"]);
    assert.equal(exists(h.path(".agents/.skill-lock.json")), false);
    assert.deepEqual(leftovers(), []);
  });
  it("install over an existing skill replaces it and keeps installedAt", async () => {
    const lock = { version: 1, skills: { alpha: { source: "old/one", sourceType: "github", originalUrl: "old/one", skillFolderHash: "h", installedAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z" }, keep: { source: "k/k" } } };
    const { h, m, r, leftovers } = await setup({
      ".agents/skills/alpha/SKILL.md": SKILL("old"),
      ".agents/skills/alpha/old.txt": "old",
      ".agents/.skill-lock.json": JSON.stringify(lock),
    });
    assert.deepEqual(await m.install(null, r.scan, updated("alpha")), { ok: true, folder: "alpha" });
    assert.equal(exists(h.path(".agents/skills/alpha/old.txt")), false);
    assert.equal(read(h.path(".agents/skills/alpha/extra.txt")), "extra");
    assert.equal(lockOf(h).skills.alpha.installedAt, "2026-01-01T00:00:00.000Z");
    assert.equal(lockOf(h).skills.alpha.updatedAt, NOW);
    assert.equal(lockOf(h).skills.alpha.source, SOURCE);
    assert.deepEqual(lockOf(h).skills.keep, { source: "k/k" });
    assert.deepEqual(leftovers(), []);
  });
  // ---- An install replaces only what the dialog said it would ----

  // A store that holds `files`, a repo with skills/<id>, and an install the
  // dialog showed as `replace`. Returns the result; every file in the home must
  // be as it was, and nothing may be left in TMPDIR or the store.
  async function refusedInstall(files, id, replace = false) {
    const s = await setup(files, fromRepo(buildRepo({ [`skills/${id}/SKILL.md`]: SKILL(id), [`skills/${id}/new.txt`]: "new" })));
    const before = snapshot(s.h.path(""));
    const result = await s.m.install(null, s.r.scan, installed(id, ["claude-code"], replace));
    assert.deepEqual(snapshot(s.h.path("")), before, "every file is as it was");
    assert.deepEqual(s.leftovers(), []);
    return { ...s, result };
  }
  it("an install the dialog showed as new refuses a grouping folder of that name and changes nothing", async () => {
    const files = {
      ".agents/skills/tools/one/SKILL.md": SKILL("one"),
      ".agents/skills/tools/two/SKILL.md": SKILL("two"),
      ".agents/skills/tools/notes.txt": "my notes",
      ".claude/skills/one": { link: "../../.agents/skills/tools/one" },
    };
    const { h, result } = await refusedInstall(files, "tools");
    assert.deepEqual(result, NOT_REPLACED("tools"));
    assert.equal(read(h.path(".claude/skills/one/SKILL.md")), SKILL("one"), "the tool's link still leads to the skill");
  });
  it("an install the dialog showed as new refuses a folder without SKILL.md and changes nothing", async () => {
    const files = { ".agents/skills/drafts/wip/notes.md": "half-written", ".agents/skills/drafts/idea.txt": "idea" };
    assert.deepEqual((await refusedInstall(files, "drafts")).result, NOT_REPLACED("drafts"));
  });
  it("an install the dialog showed as new refuses a file, a link and a dangling link of that name", async () => {
    for (const value of ["a file", { link: "../../elsewhere" }, { link: "../../ext/mine" }]) {
      const files = { ".agents/skills/alpha": value, "ext/mine/SKILL.md": SKILL("mine") };
      assert.deepEqual((await refusedInstall(files, "alpha")).result, NOT_REPLACED("alpha"), JSON.stringify(value));
    }
  });
  it("an install the dialog showed as new never replaces a folder that differs only in case", async () => {
    const files = { ".agents/skills/Alpha/SKILL.md": SKILL("mine"), ".agents/skills/Alpha/mine.txt": "mine" };
    const s = await setup(files, fromRepo(buildRepo({ "skills/Alpha/SKILL.md": SKILL("Alpha"), "skills/Alpha/new.txt": "new" })));
    const result = await s.m.install(null, s.r.scan, installed("Alpha"));
    assert.equal(read(s.h.path(".agents/skills/Alpha/mine.txt")), "mine");
    assert.equal(read(s.h.path(".agents/skills/Alpha/SKILL.md")), SKILL("mine"));
    assert.deepEqual(s.leftovers(), []);
    if (ignoresCase(s.h.path(""))) {
      // `alpha` is the same entry as `Alpha` here: refused, and nothing changed.
      assert.deepEqual(result, NOT_REPLACED("alpha"));
      assert.deepEqual(fs.readdirSync(s.h.path(".agents/skills")), ["Alpha"]);
      assert.equal(exists(s.h.path(".agents/.skill-lock.json")), false);
    } else {
      // Two different folders: `alpha` is new and `Alpha` is left alone.
      assert.deepEqual(result, { ok: true, folder: "alpha" });
      assert.deepEqual(fs.readdirSync(s.h.path(".agents/skills")).sort(), ["Alpha", "alpha"]);
      assert.equal(read(s.h.path(".agents/skills/alpha/new.txt")), "new");
    }
  });
  it("an install the dialog showed as an update refuses anything but a real skill folder", async () => {
    const cases = {
      "nothing there": {},
      "a link to a skill elsewhere": { ".agents/skills/alpha": { link: "../../ext/alpha" }, "ext/alpha/SKILL.md": SKILL("mine") },
      "a folder without SKILL.md": { ".agents/skills/alpha/notes.txt": "notes" },
      "a SKILL.md that is a link": { ".agents/skills/alpha/SKILL.md": { link: "../../../ext/SKILL.md" }, "ext/SKILL.md": SKILL("mine") },
      "a file": { ".agents/skills/alpha": "a file" },
    };
    for (const [label, files] of Object.entries(cases)) {
      assert.deepEqual((await refusedInstall(files, "alpha", true)).result, NOT_REPLACED("alpha"), label);
    }
  });
  it("the refusal names a remote machine in its sentence", async () => {
    const { h } = await setup({ ".agents/skills/alpha/notes.txt": "notes" });
    const m = createMachine({ exec: (script, args, _on, ms) => h.exec(script, args, null, ms), readText: h.readText, ...sources() });
    const scan = (await m.scan(null)).scan;
    assert.deepEqual(await m.install("remote-box", scan, installed("alpha")), NOT_REPLACED("alpha", "remote-box"));
  });
  it("an update whose old copy can't be fully removed puts the new copy in place and never half-deletes it there", async () => {
    const s = await setup({ ".agents/skills/alpha/SKILL.md": SKILL("old"), ".agents/skills/alpha/keep/data.txt": "data", ".agents/skills/alpha/old.txt": "old" });
    fs.chmodSync(s.h.path(".agents/skills/alpha/keep"), 0o555);
    try {
      assert.deepEqual(await s.m.install(null, s.r.scan, updated("alpha")), { ok: true, folder: "alpha" });
      // The new copy, whole; nothing of the old one at the destination.
      assert.deepEqual(fs.readdirSync(s.h.path(".agents/skills/alpha")).sort(), ["SKILL.md", "extra.txt"]);
      assert.equal(read(s.h.path(".agents/skills/alpha/SKILL.md")), SKILL("alpha"));
      assert.deepEqual(s.leftovers(), []);
      const staging = s.h.path(".agents/skills/.skillsgate-new.alpha");
      if (process.getuid?.() === 0) {
        assert.equal(exists(staging), false, "root removes everything");
      } else {
        // The old copy was moved aside whole before anything was removed, so
        // what could not be removed is inside the staging folder.
        assert.deepEqual(snapshot(staging).filter(([, type]) => type === "file"), [[path.join("old", "keep", "data.txt"), "file", "data"]]);
        // The next install of that skill says what is in the way.
        const again = await s.m.install(null, (await s.m.scan(null)).scan, updated("alpha"));
        assert.equal(again.ok, false);
        assert.match(again.error, /^Could not remove .+\.skillsgate-new\.alpha, left by an earlier install$/);
        assert.equal(read(s.h.path(".agents/skills/alpha/SKILL.md")), SKILL("alpha"));
      }
    } finally {
      // Writable again wherever the folder ended up, so the temp home can be removed.
      for (const rel of [".agents/skills/alpha/keep", ".agents/skills/.skillsgate-new.alpha/old/keep"]) {
        try {
          fs.chmodSync(s.h.path(rel), 0o755);
        } catch {
          // not there
        }
      }
    }
  });
  it("an update whose last move fails puts the old copy back whole", async () => {
    const { h, tmp, leftovers } = await setup({ ".agents/skills/alpha/SKILL.md": SKILL("old"), ".agents/skills/alpha/old.txt": "old", ".agents/skills/alpha/deep/er.txt": "er" });
    const before = snapshot(h.path(""));
    // An `mv` that refuses to move the new copy into place, first on the PATH.
    const shim = path.join(tmp, "shim");
    fs.mkdirSync(shim);
    const realMv = execFileSync("sh", ["-c", "command -v mv"], { encoding: "utf8" }).trim();
    fs.writeFileSync(
      path.join(shim, "mv"),
      `#!/bin/sh\nfor a in "$@"; do src=$prev; prev=$a; done\ncase "$src" in */.skillsgate-new.*/new) exit 1 ;; esac\nexec ${realMv} "$@"\n`,
      { mode: 0o755 },
    );
    const env = { HOME: h.path(""), PATH: shim + ":" + process.env.PATH, TMPDIR: tmp };
    const r = await run(INSTALL, ["file://" + repo, "alpha", h.path(".agents/skills"), "alpha", "replace"], env);
    assert.equal(r.code, 1, r.stderr);
    assert.equal(r.stdout, "");
    assert.deepEqual(snapshot(h.path("")), before, "the old copy is back, whole, and nothing else is left");
    assert.deepEqual(leftovers(), []);
  });
  it("a staging folder left half way through a swap gives the old copy back", async () => {
    // A run killed after it moved the old copy aside and before the new one went in.
    const s = await setup({
      ".agents/skills/.skillsgate-new.alpha/old/SKILL.md": SKILL("old"),
      ".agents/skills/.skillsgate-new.alpha/old/mine.txt": "mine",
      ".agents/skills/.skillsgate-new.alpha/new/SKILL.md": SKILL("half"),
    });
    // The panel saw no alpha, so the dialog showed Install; the old copy is back
    // first, so the install refuses to replace it.
    assert.deepEqual(await s.m.install(null, s.r.scan, installed("alpha")), NOT_REPLACED("alpha"));
    assert.deepEqual(fs.readdirSync(s.h.path(".agents/skills")), ["alpha"]);
    assert.equal(read(s.h.path(".agents/skills/alpha/mine.txt")), "mine");
    assert.equal(read(s.h.path(".agents/skills/alpha/SKILL.md")), SKILL("old"));
  });
  it("a staging folder left after a finished swap is removed and the update goes on", async () => {
    const s = await setup({
      ".agents/skills/.skillsgate-new.alpha/old/SKILL.md": SKILL("older"),
      ".agents/skills/alpha/SKILL.md": SKILL("old"),
    });
    assert.deepEqual(await s.m.install(null, s.r.scan, updated("alpha")), { ok: true, folder: "alpha" });
    assert.deepEqual(fs.readdirSync(s.h.path(".agents/skills")), ["alpha"]);
    assert.equal(read(s.h.path(".agents/skills/alpha/extra.txt")), "extra");
  });
  it("a failed walk for symbolic links is a failed install", async () => {
    const { h, tmp, leftovers } = await setup({ ".agents/skills/alpha/SKILL.md": SKILL("old") });
    const before = snapshot(h.path(""));
    // A `find` that fails when asked for links, first on the PATH.
    const shim = path.join(tmp, "shim");
    fs.mkdirSync(shim);
    const realFind = execFileSync("sh", ["-c", "command -v find"], { encoding: "utf8" }).trim();
    fs.writeFileSync(path.join(shim, "find"), `#!/bin/sh\ncase " $* " in *" -type l "*) exit 1 ;; esac\nexec ${realFind} "$@"\n`, { mode: 0o755 });
    const env = { HOME: h.path(""), PATH: shim + ":" + process.env.PATH, TMPDIR: tmp };
    const r = await run(INSTALL, ["file://" + repo, "alpha", h.path(".agents/skills"), "alpha", "replace"], env);
    assert.equal(r.code, 1);
    assert.match(r.stderr, /Could not check the copy for symbolic links\n$/);
    assert.deepEqual(snapshot(h.path("")), before);
    assert.deepEqual(leftovers(), []);
  });
  it("the INSTALL script copies with cp -RP, so links are never followed", () => {
    assert.match(INSTALL, /\bcp -RP -- "\$src"\/\. /);
    assert.doesNotMatch(INSTALL, /\bcp -R -- /);
  });
  it("the INSTALL script has no rm -rf of the destination", () => {
    for (const line of INSTALL.split("\n").filter((l) => /\brm -rf\b/.test(l))) {
      assert.doesNotMatch(line, /\$dest\b/, line);
    }
  });
  it("install leaves an invalid lock untouched and warns", async () => {
    const { h, m, r } = await setup({ ".agents/.skill-lock.json": "{nope" });
    const result = await m.install(null, r.scan, installed("alpha"));
    assert.equal(result.ok, true);
    assert.equal(result.folder, "alpha");
    assert.match(result.warn, /skill lock was not updated \(invalid\)/);
    assert.equal(read(h.path(".agents/.skill-lock.json")), "{nope");
    assert.equal(exists(h.path(".agents/skills/alpha/SKILL.md")), true);
  });
  it("install leaves a lock of another version untouched and says so", async () => {
    const other = '{"version":3,"skills":{}}';
    const { h, m, r } = await setup({ ".agents/.skill-lock.json": other });
    const result = await m.install(null, r.scan, installed("alpha"));
    assert.deepEqual(result, { ok: true, folder: "alpha", warn: "Installed, but the skill lock was not updated (another version)" });
    assert.equal(read(h.path(".agents/.skill-lock.json")), other);
  });
  it("install never writes through a lock that is a symbolic link and says so", async () => {
    const linked = '{"version":1,"skills":{}}';
    const { h, m, r } = await setup({ "dotfiles/lock.json": linked, ".agents/.skill-lock.json": { link: "../dotfiles/lock.json" } });
    const result = await m.install(null, r.scan, installed("alpha"));
    assert.deepEqual(result, { ok: true, folder: "alpha", warn: "Installed, but the skill lock was not updated (symbolic link)" });
    assert.equal(isLink(h.path(".agents/.skill-lock.json")), true, "still a link");
    assert.equal(read(h.path("dotfiles/lock.json")), linked, "the linked file is as it was");
    assert.deepEqual(fs.readdirSync(h.path(".agents")).sort(), [".skill-lock.json", "skills"], "no temp file left");
  });
  it("the WRITE script refuses to replace a lock that is a symbolic link", async () => {
    const { h } = await setup({ "dotfiles/lock.json": "original", "d/lock.json": { link: "../dotfiles/lock.json" }, "d/dangling.json": { link: "nowhere" } });
    for (const name of ["lock.json", "dangling.json"]) {
      assert.equal((await h.exec(WRITE, [h.path(`d/${name}`), "replaced", "replace"], null, 30000)).code, 4, name);
      assert.equal(isLink(h.path(`d/${name}`)), true, name);
    }
    assert.equal(read(h.path("dotfiles/lock.json")), "original");
    assert.deepEqual(fs.readdirSync(h.path("d")).sort(), ["dangling.json", "lock.json"]);
  });
  it("install leaves a lock over 96 KiB untouched and warns", async () => {
    const big = JSON.stringify({ version: 1, skills: { x: { source: "y".repeat(100 * 1024) } } });
    const { h, m, r } = await setup({ ".agents/.skill-lock.json": big });
    const result = await m.install(null, r.scan, installed("alpha"));
    assert.equal(result.ok, true);
    assert.match(result.warn, /skill lock was not updated \(large\)/);
    assert.equal(read(h.path(".agents/.skill-lock.json")), big);
  });
  it("install reports a failed download with git's reason", async () => {
    const { h, m, r, leftovers } = await setup({}, { url: "file:///nowhere" });
    const result = await m.install(null, r.scan, installed("alpha"));
    assert.equal(result.ok, false);
    // git says "fatal: '/nowhere' does not appear to be a git repository", then
    // advice; its reason is what the person reads.
    assert.match(result.error, /^Could not download acme\/skills: .*\/nowhere.*$/);
    assert.doesNotMatch(result.error, /fatal:|repository exists/);
    assert.equal(exists(h.path(".agents")), false);
    assert.deepEqual(leftovers(), []);
  });
  it("the INSTALL script prints git's reason for a failed clone as its one line on stderr", async () => {
    const { h, tmp } = await setup();
    const env = { HOME: h.path(""), PATH: process.env.PATH, TMPDIR: tmp };
    const r = await run(INSTALL, ["file:///nowhere", "alpha", h.path(".agents/skills"), "alpha", "new"], env);
    assert.equal(r.code, 2);
    assert.equal(r.stderr.split("\n").filter(Boolean).length, 1, r.stderr);
    assert.match(r.stderr, /\/nowhere/);
  });
  it("install says git's reason, or only that the download failed when git gave none", async () => {
    const scan = { home: "/h", git: true, tools: [{ name: "universal", dir: "/h/.agents/skills", detected: true }], entries: [] };
    const answer = (stderr) => createMachine({ exec: async () => ({ code: 2, stdout: "", stderr }), readText: async () => null, ...sources() });
    assert.deepEqual(await answer("transport 'ssh' not allowed\n").install(null, scan, installed("alpha")), {
      ok: false,
      error: "Could not download acme/skills: transport 'ssh' not allowed",
    });
    assert.deepEqual(await answer("").install(null, scan, installed("alpha")), { ok: false, error: "Could not download acme/skills" });
  });
  it("the INSTALL script lets the person's own git config fetch GitHub over ssh", () => {
    // The URL passed is always https://; only a rewrite in the person's git
    // config (url.<base>.insteadOf) can turn it into ssh.
    assert.match(INSTALL, /\nGIT_ALLOW_PROTOCOL=https:file:ssh\n/);
  });
  it("install refuses an id it can't pass safely", async () => {
    const { m, r, calls } = await setup();
    const before = calls.length;
    for (const skillId of ["a;rm -rf ~", "", "../x", "-x", ".hidden", "a/b", "a\n"]) {
      assert.deepEqual(await m.install(null, r.scan, installed(skillId)), { ok: false, error: `Can't install "${skillId}" from acme/skills` }, JSON.stringify(skillId));
    }
    assert.deepEqual(await m.install(null, r.scan, { source: "a b/c", skillId: "x", tools: [] }), { ok: false, error: `Can't install "x" from a b/c` });
    assert.deepEqual(await m.install(null, r.scan, { source: "-x/y", skillId: "x", tools: [] }), { ok: false, error: `Can't install "x" from -x/y` });
    // What the dialog showed must come with it: replace is true or false.
    for (const replace of [undefined, null, "true", 1]) {
      const bad = { source: SOURCE, skillId: "alpha", tools: [], replace };
      assert.deepEqual(await m.install(null, r.scan, bad), { ok: false, error: `Can't install "alpha" from acme/skills` }, String(replace));
    }
    assert.equal(calls.length, before);
  });
  it("install refuses when git is missing without running anything", async () => {
    const { m, r, calls } = await setup();
    const before = calls.length;
    assert.deepEqual(await m.install(null, { ...r.scan, git: false }, installed("alpha")), { ok: false, error: "git is not installed on this computer" });
    assert.deepEqual(await m.install("remote-box", { ...r.scan, git: false }, installed("alpha")), { ok: false, error: "git is not installed on remote-box" });
    assert.equal(calls.length, before);
  });
  it("install maps the script's exit 127 to the git message", async () => {
    const m = createMachine({ exec: async () => ({ code: 127, stdout: "", stderr: "" }), readText: async () => null, ...sources() });
    const scan = { home: "/h", git: true, tools: [{ name: "universal", dir: "/h/.agents/skills", detected: true }], entries: [] };
    assert.deepEqual(await m.install(null, scan, installed("alpha")), { ok: false, error: "git is not installed on this computer" });
  });
  it("install names the machine in its sentence when the shared skills folder is unknown", async () => {
    const calls = [];
    const m = createMachine({ exec: async (...args) => (calls.push(args), { code: 0, stdout: "", stderr: "" }), readText: async () => null, ...sources() });
    const scan = { home: "/h", git: true, tools: [{ name: "claude-code", dir: "/h/.claude/skills", detected: true }], entries: [] };
    assert.deepEqual(await m.install(null, scan, installed("alpha")), { ok: false, error: "Could not find the shared skills folder on this computer" });
    assert.deepEqual(await m.install("vps", scan, installed("alpha")), { ok: false, error: "Could not find the shared skills folder on vps" });
    assert.deepEqual(calls, [], "nothing ran on the machine");
  });
  it("install calls onStep before each step on the machine after the copy", async () => {
    const h = makeHome({});
    const events = [];
    const names = new Map([[INSTALL, "install"], [LINK, "link"], [WRITE, "write"]]);
    const exec = (script, ...rest) => {
      events.push(names.get(script) ?? "other");
      return h.exec(script, ...rest);
    };
    const readText = (...args) => {
      events.push("read");
      return h.readText(...args);
    };
    const m = createMachine({ exec, readText, ...sources() });
    const scan = (await m.scan(null)).scan;
    events.length = 0;
    const result = await m.install(null, scan, { ...installed("alpha", ["claude-code", "cursor"]), onStep: () => events.push("step") });
    assert.deepEqual(result, { ok: true, folder: "alpha" });
    assert.deepEqual(events, ["install", "step", "link", "step", "link", "step", "read", "step", "write"]);
  });
  it("install goes on when onStep throws", async () => {
    const { h, m, r } = await setup();
    const onStep = () => {
      throw new Error("shared store went away");
    };
    assert.deepEqual(await m.install(null, r.scan, { ...installed("alpha", ["claude-code"]), onStep }), { ok: true, folder: "alpha" });
    assert.equal(isLink(h.path(".claude/skills/alpha")), true);
    assert.equal(lockOf(h).skills.alpha.source, SOURCE);
  });
  it("install without tools installs to the store only", async () => {
    const { h, m, r } = await setup();
    assert.deepEqual(await m.install(null, r.scan, installed("alpha")), { ok: true, folder: "alpha" });
    assert.equal(exists(h.path(".claude")), false);
    assert.equal(exists(h.path(".cursor")), false);
    assert.deepEqual(await m.install(null, r.scan, installed("beta", ["universal"])), { ok: true, folder: "beta" });
  });
  it("install warns about a tool it can't add the skill to and joins the warnings", async () => {
    const { h, m, r } = await setup({ ".cursor/skills/alpha/SKILL.md": SKILL("mine"), ".agents/.skill-lock.json": "{nope" });
    const result = await m.install(null, r.scan, installed("alpha", ["cursor", "no-such-tool", "claude-code"]));
    assert.equal(result.ok, true);
    assert.equal(
      result.warn,
      'Installed, but not added to Cursor: A different copy of "alpha" is already in Cursor; Installed, but not added to no-such-tool: unknown tool; Installed, but the skill lock was not updated (invalid)',
    );
    assert.equal(isLink(h.path(".claude/skills/alpha")), true);
    assert.equal(read(h.path(".cursor/skills/alpha/SKILL.md")), SKILL("mine"));
  });
  it("remove drops the lock entry", async () => {
    const { h, m, r } = await setup();
    await m.install(null, r.scan, installed("alpha", ["claude-code"]));
    await m.install(null, r.scan, installed("beta"));
    const again = await m.scan(null);
    const alpha = again.skills.find((s) => s.folder === "alpha");
    assert.deepEqual(await m.remove(null, again.scan, alpha), { ok: true });
    assert.equal(exists(h.path(".agents/skills/alpha")), false);
    assert.equal(isLink(h.path(".claude/skills/alpha")), false);
    assert.deepEqual(Object.keys(lockOf(h).skills), ["beta"]);
  });
  it("remove leaves an unreadable lock alone and says nothing about it", async () => {
    const { h, m, r } = await setup({ ".agents/skills/alpha/SKILL.md": SKILL("alpha"), ".agents/.skill-lock.json": "{nope" });
    const alpha = r.skills.find((s) => s.folder === "alpha");
    assert.deepEqual(await m.remove(null, r.scan, alpha), { ok: true });
    assert.equal(exists(h.path(".agents/skills/alpha")), false);
    assert.equal(read(h.path(".agents/.skill-lock.json")), "{nope");
  });
  it("remove writes no lock when the skill has no entry", async () => {
    const lock = '{"version":1,"skills":{"docx":{}}}';
    const { h, m, r, calls } = await setup({ ".agents/skills/alpha/SKILL.md": SKILL("alpha"), ".agents/.skill-lock.json": lock });
    const before = calls.length;
    assert.deepEqual(await m.remove(null, r.scan, r.skills.find((s) => s.folder === "alpha")), { ok: true });
    assert.equal(calls.length, before + 1); // REMOVE only
    assert.equal(read(h.path(".agents/.skill-lock.json")), lock);
  });
  it("remove leaves the lock alone when the removal is refused", async () => {
    const { h, m, r } = await setup({ ".agents/skills/alpha/SKILL.md": SKILL("alpha"), ".agents/.skill-lock.json": '{"version":1,"skills":{"alpha":{}}}' });
    const alpha = r.skills.find((s) => s.folder === "alpha");
    fs.rmSync(h.path(".agents/skills/alpha/SKILL.md"));
    assert.equal((await m.remove(null, r.scan, alpha)).ok, false);
    assert.deepEqual(Object.keys(lockOf(h).skills), ["alpha"]);
  });

  // The failure paths of the script itself.
  const run = (script, args, env) =>
    new Promise((resolve) =>
      execFile("/bin/sh", ["-c", script, "skillsgate", ...args], { env, timeout: 60000 }, (err, stdout, stderr) =>
        resolve({ code: err ? (typeof err.code === "number" ? err.code : -1) : 0, stdout: String(stdout), stderr: String(stderr) }),
      ),
    );

  it("a failed copy never replaces a working skill and leaves nothing behind", async () => {
    const { h, tmp, leftovers } = await setup({ ".agents/skills/alpha/SKILL.md": SKILL("old"), ".agents/skills/alpha/old.txt": "old" });
    // A `cp` that always fails, first on the PATH.
    const shim = path.join(tmp, "shim");
    fs.mkdirSync(shim);
    fs.writeFileSync(path.join(shim, "cp"), "#!/bin/sh\nexit 1\n", { mode: 0o755 });
    const env = { HOME: h.path(""), PATH: shim + ":" + process.env.PATH, TMPDIR: tmp };
    const r = await run(INSTALL, ["file://" + repo, "alpha", h.path(".agents/skills"), "alpha", "replace"], env);
    assert.notEqual(r.code, 0);
    assert.equal(r.stdout, "");
    assert.equal(read(h.path(".agents/skills/alpha/SKILL.md")), SKILL("old"));
    assert.equal(read(h.path(".agents/skills/alpha/old.txt")), "old");
    assert.deepEqual(fs.readdirSync(h.path(".agents/skills")), ["alpha"]);
    assert.deepEqual(leftovers(), []);
  });
  it("an install that fails leaves the existing folder's files exactly as they were", async () => {
    const { h, m, r, leftovers } = await setup({ ".agents/skills/nope/SKILL.md": SKILL("mine"), ".agents/skills/nope/notes.txt": "keep" });
    assert.equal((await m.install(null, r.scan, updated("nope"))).ok, false);
    assert.equal(read(h.path(".agents/skills/nope/SKILL.md")), SKILL("mine"));
    assert.equal(read(h.path(".agents/skills/nope/notes.txt")), "keep");
    assert.deepEqual(fs.readdirSync(h.path(".agents/skills")), ["nope"]);
    assert.deepEqual(leftovers(), []);
  });
  it("install leaves a real skill named like the old staging name alone", async () => {
    const { h, m, r } = await setup({
      ".agents/skills/alpha/SKILL.md": SKILL("old"),
      ".agents/skills/alpha.new/SKILL.md": SKILL("a skill of its own"),
      ".agents/skills/alpha.new/own.txt": "mine",
    });
    assert.deepEqual(await m.install(null, r.scan, updated("alpha")), { ok: true, folder: "alpha" });
    assert.equal(read(h.path(".agents/skills/alpha.new/SKILL.md")), SKILL("a skill of its own"));
    assert.equal(read(h.path(".agents/skills/alpha.new/own.txt")), "mine");
    assert.equal(read(h.path(".agents/skills/alpha/extra.txt")), "extra");
    assert.deepEqual(fs.readdirSync(h.path(".agents/skills")).sort(), ["alpha", "alpha.new"]);
  });
  it("install removes a stale staging folder and succeeds", async () => {
    const { h, m, r } = await setup({
      ".agents/skills/.skillsgate-new.alpha/junk.txt": "junk",
      ".agents/skills/.skillsgate-new.alpha/deeper/more.txt": "junk",
    });
    assert.deepEqual(await m.install(null, r.scan, installed("alpha")), { ok: true, folder: "alpha" });
    assert.deepEqual(fs.readdirSync(h.path(".agents/skills")), ["alpha"]);
    assert.equal(exists(h.path(".agents/skills/alpha/junk.txt")), false);
  });
  it("no install, successful or failed, leaves a staging entry in the store", async () => {
    const stagingIn = (h) => fs.readdirSync(h.path(".agents/skills")).filter((n) => n.startsWith(".skillsgate-new."));
    const ok = await setup({ ".agents/skills/other/SKILL.md": SKILL("other") });
    assert.equal((await ok.m.install(null, ok.r.scan, installed("alpha"))).ok, true);
    assert.deepEqual(stagingIn(ok.h), []);
    const missing = await setup({ ".agents/skills/other/SKILL.md": SKILL("other") });
    assert.equal((await missing.m.install(null, missing.r.scan, installed("nope"))).ok, false);
    assert.deepEqual(stagingIn(missing.h), []);
    const down = await setup({ ".agents/skills/other/SKILL.md": SKILL("other") }, { url: "file:///nowhere" });
    assert.equal((await down.m.install(null, down.r.scan, installed("alpha"))).ok, false);
    assert.deepEqual(stagingIn(down.h), []);
  });
  it("a scan does not list a staging folder that holds a SKILL.md", async () => {
    const { r } = await setup({ ".agents/skills/.skillsgate-new.x/SKILL.md": SKILL("x"), ".agents/skills/real/SKILL.md": SKILL("real") });
    assert.deepEqual(r.skills.map((s) => s.folder), ["real"]);
  });
  it("the INSTALL script refuses bad arguments before it touches anything", async () => {
    const { h, tmp, leftovers } = await setup({ ".agents/skills/precious/SKILL.md": SKILL("p"), ".agents/precious.txt": "p" });
    const env = { HOME: h.path(""), PATH: process.env.PATH, TMPDIR: tmp };
    const store = h.path(".agents/skills");
    const url = "file://" + repo;
    const cases = [
      [url, "alpha", store, "", "new"],
      [url, "alpha", store, ".", "new"],
      [url, "alpha", store, "..", "new"],
      [url, "alpha", store, "a/b", "new"],
      [url, "alpha", store, "../precious", "replace"],
      [url, "alpha", store, ".hidden", "new"],
      [url, "alpha", store, "-x", "new"],
      [url, "alpha", "", "alpha", "new"],
      [url, "alpha", "relative/skills", "alpha", "new"],
      [url, "", store, "alpha", "new"],
      [url, "a/b", store, "alpha", "new"],
      [url, "..", store, "alpha", "new"],
      [url, "-x", store, "alpha", "new"],
      [url, "a b", store, "alpha", "new"],
      ["", "alpha", store, "alpha", "new"],
      ["ext::sh -c touch pwned", "alpha", store, "alpha", "new"],
      ["--upload-pack=x", "alpha", store, "alpha", "new"],
      // what the caller expects at the destination: only `new` or `replace`
      [url, "precious", store, "precious"],
      [url, "precious", store, "precious", ""],
      [url, "precious", store, "precious", "NEW"],
      [url, "precious", store, "precious", "update"],
      [url, "precious", store, "precious", "replace "],
      [url, "alpha", store],
      [],
    ];
    for (const args of cases) {
      const r = await run(INSTALL, args, env);
      assert.equal(r.code, 64, JSON.stringify(args));
      assert.equal(r.stdout, "");
    }
    assert.deepEqual(fs.readdirSync(h.path(".agents")).sort(), ["precious.txt", "skills"]);
    assert.deepEqual(fs.readdirSync(store), ["precious"]);
    assert.deepEqual(leftovers(), []);
  });
  it("the INSTALL script prints the installed folder and takes a store that does not exist yet", async () => {
    const { h, tmp } = await setup();
    const env = { HOME: h.path(""), PATH: process.env.PATH, TMPDIR: tmp };
    const r = await run(INSTALL, ["file://" + repo, "beta", h.path("deep/er/skills"), "beta", "new"], env);
    assert.equal(r.code, 0, r.stderr);
    assert.equal(r.stdout, h.home + "/deep/er/skills/beta\n"); // the real path
    assert.equal(exists(h.path("deep/er/skills/beta/SKILL.md")), true);
  });
  // The script adds the Homebrew folders to PATH itself, so this only holds on a
  // machine that has no git there.
  const brewGit = ["/opt/homebrew/bin/git", "/usr/local/bin/git"].some((p) => fs.existsSync(p));
  it("the INSTALL script exits 127 without git", { skip: brewGit ? "git is also in a Homebrew folder" : false }, async () => {
    const { h, tmp } = await setup();
    const bin = path.join(tmp, "empty-bin");
    fs.mkdirSync(bin);
    const r = await run(INSTALL, ["file://" + repo, "beta", h.path(".agents/skills"), "beta", "new"], { HOME: h.path(""), PATH: bin, TMPDIR: tmp });
    assert.equal(r.code, 127);
    assert.equal(exists(h.path(".agents")), false);
  });
  it("the WRITE script writes beside the target, makes the folder and leaves no temp file", async () => {
    const { h } = await setup();
    const file = h.path("new dir/.skill-lock.json");
    assert.equal((await h.exec(WRITE, [file, "one\ntwo 'quoted' $HOME `x`\n", "new"], null, 30000)).code, 0);
    assert.equal(read(file), "one\ntwo 'quoted' $HOME `x`\n");
    assert.equal((await h.exec(WRITE, [file, "replaced", "replace"], null, 30000)).code, 0);
    assert.equal(read(file), "replaced");
    assert.deepEqual(fs.readdirSync(h.path("new dir")), [".skill-lock.json"]);
  });
  it("the WRITE script with new refuses an existing target, with replace it replaces it", async () => {
    const { h } = await setup({ "d/lock.json": "original" });
    const file = h.path("d/lock.json");
    const refused = await h.exec(WRITE, [file, "other", "new"], null, 30000);
    assert.equal(refused.code, 3);
    assert.equal(read(file), "original");
    assert.deepEqual(fs.readdirSync(h.path("d")), ["lock.json"]);
    // A dangling link counts as "something is there".
    fs.symlinkSync("nowhere", h.path("d/dangling.json"));
    assert.equal((await h.exec(WRITE, [h.path("d/dangling.json"), "x", "new"], null, 30000)).code, 3);
    assert.deepEqual(fs.readdirSync(h.path("d")).sort(), ["dangling.json", "lock.json"]);
    assert.equal((await h.exec(WRITE, [file, "other", "replace"], null, 30000)).code, 0);
    assert.equal(read(file), "other");
    assert.deepEqual(fs.readdirSync(h.path("d")).sort(), ["dangling.json", "lock.json"]);
  });
  it("the WRITE script refuses bad arguments", async () => {
    const { h } = await setup({ "keep.txt": "keep" });
    const target = h.path("x");
    const cases = [[], [target], [target, "text"], ["relative.json", "text", "new"], ["", "text", "new"], [h.path("x/"), "text", "new"], [target, "", "new"], [target, "text", ""], [target, "text", "NEW"], [target, "text", "other"]];
    for (const args of cases) {
      assert.equal((await h.exec(WRITE, args, null, 30000)).code, 2, JSON.stringify(args));
    }
    assert.equal(exists(target), false);
    assert.deepEqual(fs.readdirSync(h.home).sort(), ["keep.txt"]);
  });
  it("a lock the mod writes gets the umask's mode, not 0600", async () => {
    const { h, m, r } = await setup();
    assert.equal((await m.install(null, r.scan, installed("alpha"))).ok, true);
    assert.equal(fs.statSync(h.path(".agents/.skill-lock.json")).mode & 0o777, 0o666 & ~process.umask());
  });
  it("install leaves the lock alone when it can't be read", async () => {
    const h = makeHome({ ".agents/.skill-lock.json": '{"version":1,"skills":{"keep":{}}}' });
    const before = read(h.path(".agents/.skill-lock.json"));
    const calls = [];
    const exec = (script, ...rest) => {
      calls.push(script);
      return h.exec(script, ...rest);
    };
    const readText = async () => {
      throw new Error("permission denied");
    };
    const m = createMachine({ exec, readText, ...sources() });
    const scan = (await m.scan(null)).scan;
    const result = await m.install(null, scan, installed("alpha"));
    assert.equal(result.ok, true);
    assert.equal(result.folder, "alpha");
    assert.match(result.warn, /skill lock was not updated \(unreadable\)/);
    assert.equal(read(h.path(".agents/.skill-lock.json")), before);
    assert.equal(calls.includes(WRITE), false);
    assert.equal(exists(h.path(".agents/skills/alpha/SKILL.md")), true);
  });
  it("install does not replace a lock that appeared after it was read as absent", async () => {
    const lock = '{"version":1,"skills":{"keep":{}}}';
    const h = makeHome({ ".agents/.skill-lock.json": lock });
    const m = createMachine({ exec: h.exec, readText: async () => null, ...sources() }); // wrongly "absent"
    const scan = (await m.scan(null)).scan;
    const result = await m.install(null, scan, installed("alpha"));
    assert.equal(result.ok, true);
    assert.match(result.warn, /skill lock was not updated \(changed\)/);
    assert.equal(read(h.path(".agents/.skill-lock.json")), lock);
    assert.deepEqual(fs.readdirSync(h.path(".agents")).sort(), [".skill-lock.json", "skills"]);
  });
  it("remove leaves the lock alone when it can't be read", async () => {
    const lock = '{"version":1,"skills":{"alpha":{}}}';
    const h = makeHome({ ".agents/skills/alpha/SKILL.md": SKILL("alpha"), ".agents/.skill-lock.json": lock });
    const m = createMachine({ exec: h.exec, readText: async () => { throw new Error("denied"); }, ...sources() });
    const scan = await m.scan(null);
    assert.deepEqual(await m.remove(null, scan.scan, scan.skills.find((s) => s.folder === "alpha")), { ok: true });
    assert.equal(exists(h.path(".agents/skills/alpha")), false);
    assert.equal(read(h.path(".agents/.skill-lock.json")), lock);
  });
});
