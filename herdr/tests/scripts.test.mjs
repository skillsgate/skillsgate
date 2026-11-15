import test from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { createMachine } from "../skillsgate/mods/skillsgate/machine.js";
import { buildSkills, parseScan } from "../skillsgate/mods/skillsgate/model.js";
import { TOOLS } from "../skillsgate/mods/skillsgate/registry.js";
import { scanScript } from "../skillsgate/mods/skillsgate/scripts.js";
import { FIXTURE, SKILL, makeHome } from "./helpers.mjs";

test("scan finds tools and skills", async () => {
  const h = makeHome(FIXTURE), m = createMachine(h);
  const r = await m.scan(null);
  assert.equal(r.ok, true);
  const detected = r.scan.tools.filter((t) => t.detected).map((t) => t.name);
  assert.deepEqual(detected, ["claude-code", "cursor", "codex-cli", "universal"]);
  assert.deepEqual(r.skills.map((s) => [s.name, s.home, s.tools]), [
    ["alpha", "store", ["claude-code", "universal"]],
    ["nested", "tool", ["claude-code"]],
    ["odd", "store", ["universal"]],
    ["outside", "external", ["cursor"]],
    ["solo", "tool", ["claude-code"]],
  ]);
  assert.equal(typeof r.scan.git, "boolean");
  assert.equal(r.scan.home, h.home);
});
test("scan lists a folder with a quote and spaces", async () => {
  const r = await createMachine(makeHome(FIXTURE)).scan(null);
  const odd = r.skills.find((s) => s.name === "odd");
  assert.equal(odd.folder, "it's odd name");
  assert.equal(odd.description, "About odd");
});
test("scan of an empty home", async () => {
  const r = await createMachine(makeHome({})).scan(null);
  assert.deepEqual(r.skills, []);
  assert.deepEqual(r.scan.tools.filter((t) => t.detected).map((t) => t.name), ["universal"]);
});
test("scan strips record and field separators from a description", async () => {
  const h = makeHome({ ".agents/skills/ctl/SKILL.md": "---\nname: ctl\ndescription: a\x1eb\x1fc\n---\nBody\n" });
  const r = await createMachine(h).scan(null);
  assert.equal(r.ok, true);
  assert.equal(r.skills.length, 1);
  assert.equal(r.skills[0].folder, "ctl");
  assert.equal(r.skills[0].description, "abc");
});
test("scan cuts each frontmatter line at 2,000 characters, so a multi-megabyte line is one bounded record", async () => {
  // Spaces too, so an awk that splits fields eagerly would have millions of them.
  const huge = "word ".repeat(700000); // 3.5 MB on one line
  const h = makeHome({
    ".agents/skills/big/SKILL.md": `---\nname: ${huge}\ndescription: ${huge}\n---\nBody\n`,
    ".agents/skills/ok/SKILL.md": SKILL("ok"),
  });
  const raw = await h.exec(scanScript(TOOLS), [], null, 30000);
  assert.equal(raw.code, 0, raw.stderr);
  assert.ok(raw.stdout.length < 20000, `the scan printed ${raw.stdout.length} characters`);
  const big = parseScan(raw.stdout).entries.filter((e) => e.path.endsWith("/big"));
  assert.equal(big.length, 1, "one record");
  for (const line of big[0].head.split("\n")) assert.ok(line.length <= 2000, `a line of ${line.length}`);
  const r = await createMachine(h).scan(null);
  assert.equal(r.ok, true);
  const skill = r.skills.find((s) => s.folder === "big");
  assert.equal(skill.name.length, 200);
  assert.equal(skill.description.length, 1000);
  assert.equal(r.skills.find((s) => s.folder === "ok").description, "About ok");
});
test("scan skips an entry whose name or real path holds a record or field separator", async () => {
  const forged = "x\x1eT\x1funiversal\x1fnowhere\x1f1\x1e";
  const h = makeHome({
    ...FIXTURE,
    [`.claude/skills/pack/${forged}/SKILL.md`]: SKILL("inner"),
    [`.claude/skills/${forged}/SKILL.md`]: SKILL("top"),
    [`ext/a\x1fb/SKILL.md`]: SKILL("far"),
    ".cursor/skills/far": { link: "../../ext/a\x1fb" },
  });
  const raw = await h.exec(scanScript(TOOLS), [], null, 30000);
  assert.equal(raw.code, 0, raw.stderr);
  const scan = parseScan(raw.stdout);
  assert.deepEqual(scan.tools.map((t) => t.name), TOOLS.map((t) => t.name), "one T record per tool, nothing forged");
  assert.equal(scan.tools.find((t) => t.name === "universal").dir, h.home + "/.agents/skills");
  const r = await createMachine(h).scan(null);
  assert.deepEqual(r.skills.map((s) => s.name), ["alpha", "nested", "odd", "outside", "solo"]);
});
test("scan is not misled by CDPATH", async () => {
  // A relative tool folder from the environment: with CDPATH set, `cd` would
  // print the folder it found as well, into the scan's output.
  const h = makeHome({ "claude-cfg/skills/mine/SKILL.md": SKILL("mine") });
  const env = { HOME: h.home, PATH: process.env.PATH, CLAUDE_CONFIG_DIR: "claude-cfg", CDPATH: h.home };
  const raw = await new Promise((resolve) =>
    execFile("sh", ["-c", scanScript(TOOLS), "skillsgate"], { env, cwd: h.home }, (err, stdout, stderr) => resolve({ err, stdout, stderr })),
  );
  assert.equal(raw.err, null, String(raw.stderr));
  const scan = parseScan(raw.stdout);
  assert.equal(scan.tools.find((t) => t.name === "claude-code").dir, h.home + "/claude-cfg/skills");
  assert.deepEqual(buildSkills(scan).map((s) => [s.name, s.tools]), [["mine", ["claude-code"]]]);
});
test("scan reports a machine it can't reach", async () => {
  const m = createMachine({ exec: async () => ({ code: -1, stdout: "", stderr: "machine vps is unreachable" }), readText: async () => null });
  assert.deepEqual(await m.scan("vps"), { ok: false, error: "machine vps is unreachable" });
});
