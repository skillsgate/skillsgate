import test from "node:test";
import assert from "node:assert/strict";
import { createMachine } from "../skillsgate/mods/skillsgate/machine.js";
import { makeHome } from "./helpers.mjs";

const SKILL = (name) => `---\nname: ${name}\ndescription: About ${name}\n---\nBody\n`;
const FIXTURE = {
  ".agents/skills/alpha/SKILL.md": SKILL("alpha"),
  ".agents/skills/it's odd name/SKILL.md": SKILL("odd"),
  ".claude/skills/alpha": { link: "../../.agents/skills/alpha" },
  ".claude/skills/solo/SKILL.md": SKILL("solo"),
  ".claude/skills/group/nested/SKILL.md": SKILL("nested"),
  ".claude/skills/broken": { link: "../nowhere" },
  ".claude/skills/notes/readme.txt": "not a skill",
  ".codex/config.toml": "",
  "ext/outside/SKILL.md": SKILL("outside"),
  ".cursor/skills/outside": { link: "../../ext/outside" },
};
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
test("scan reports a machine it can't reach", async () => {
  const m = createMachine({ exec: async () => ({ code: -1, stdout: "", stderr: "machine vps is unreachable" }), readText: async () => null });
  assert.deepEqual(await m.scan("vps"), { ok: false, error: "machine vps is unreachable" });
});
