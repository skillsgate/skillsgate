import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { TOOLS, UNIVERSAL } from "../skillsgate/mods/skillsgate/registry.js";

const MOD = "herdr/skillsgate/mods/skillsgate"; // tests run from the repo root

test("registry matches the desktop app", () => {
  const src = readFileSync("apps/desktop/src/main/ipc-handlers.ts", "utf8");
  const block = src.slice(src.indexOf("const agentRegistry"), src.indexOf("// Canonical skill storage"));
  const desktop = [...block.matchAll(/name: "([^"]+)",\s+displayName: "([^"]+)",\s+shortCode: "([^"]+)"/g)]
    .map(([, name, displayName, shortCode]) => ({ name, displayName, shortCode }));
  assert.equal(desktop.length, 25);
  assert.deepEqual(TOOLS.map(({ name, displayName, shortCode }) => ({ name, displayName, shortCode })), desktop);
  assert.equal(TOOLS.at(-1).name, UNIVERSAL);
});

test("tool folders that are not $HOME/.<name>/skills", () => {
  const dir = (n) => TOOLS.find((t) => t.name === n).dir;
  assert.equal(dir("claude-code"), "${CLAUDE_CONFIG_DIR:-$HOME/.claude}/skills");
  assert.equal(dir("github-copilot"), "${XDG_CONFIG_HOME:-$HOME/.config}/github-copilot/skills");
  assert.equal(dir("codex-cli"), "${CODEX_HOME:-$HOME/.codex}/skills");
  assert.equal(dir("droid-cli"), "${FACTORY_HOME:-$HOME/.factory}/skills");
  assert.equal(dir("ob-1"), "${OB1_HOME:-$HOME/.ob1}/skills");
  assert.equal(dir("zed"), "${XDG_CONFIG_HOME:-$HOME/.config}/zed/skills");
  assert.equal(dir("muse-code"), "${XDG_CONFIG_HOME:-$HOME/.config}/muse/skills");
  assert.equal(dir("qwenpaw"), "$HOME/.qwenpaw/skill_pool");
  assert.equal(dir("universal"), "$HOME/.agents/skills");
  assert.deepEqual(TOOLS.find((t) => t.name === "openclaw").detect, ["$HOME/.openclaw", "$HOME/.clawdbot", "$HOME/.moltbot"]);
  assert.deepEqual(TOOLS.find((t) => t.name === "universal").detect, ["$HOME"]);
});

test("mod.json", () =>
  assert.deepEqual(JSON.parse(readFileSync(MOD + "/mod.json", "utf8")), { place: "none", title: "SkillsGate", focusable: true }));

// Logic modules take Herdr's functions as arguments, so node --test covers
// them. Views draw with Herdr's UI kit and may import Herdr. A new file must
// be added to one of the two lists.
const LOGIC = ["registry.js", "scripts.js", "model.js", "machine.js", "catalog.js", "channel.js", "requests.js"];
const VIEWS = ["main.js", "host.js", "ui.js", "toggle.js", "panel.js", "installed-tab.js", "discover-tab.js", "machines-tab.js", "skill-dialog.js"];
const source = (f) => readFileSync(`${MOD}/${f}`, "utf8");
const localImports = (f) => [...source(f).matchAll(/from "\.\/([^"]+)"/g)].map((m) => m[1]);

test("the logic modules import no Herdr code", () => {
  for (const f of LOGIC) assert.doesNotMatch(source(f), /from "(herdr|gpui-kit|gpui-base)"/, f);
});
test("every module in the mod folder is either logic or a view", () => {
  const files = readdirSync(MOD).filter((f) => f.endsWith(".js")).sort();
  assert.deepEqual(files, [...LOGIC, ...VIEWS].sort());
});
test("logic imports only logic, and host.js and ui.js import no view", () => {
  for (const f of LOGIC) assert.deepEqual(localImports(f).filter((i) => !LOGIC.includes(i)), [], f);
  assert.deepEqual(localImports("host.js").filter((i) => !LOGIC.includes(i)), []);
  assert.deepEqual(localImports("ui.js").filter((i) => !LOGIC.includes(i) && i !== "host.js"), []);
});

// Each class in a file, read from the source text as the code is formatted:
// a class runs from its `class Name` line to the next "}" at column 0, its
// methods and getters are the members written two spaces in, and its fields
// are every `this.<name> =` inside it.
function classesOf(text) {
  const lines = text.split("\n");
  const classes = [];
  for (let i = 0; i < lines.length; i++) {
    const head = /^(?:export\s+)?(?:default\s+)?class\s+([A-Za-z_$][\w$]*)/.exec(lines[i]);
    if (!head) continue;
    let end = i + 1;
    while (end < lines.length && lines[end] !== "}") end++;
    const body = lines.slice(i + 1, end);
    const methods = new Set();
    for (const line of body) {
      const m = /^ {2}(?:static\s+)?(?:async\s+)?(?:get\s+|set\s+)?\*?([A-Za-z_$][\w$]*)\s*\(/.exec(line);
      if (m && m[1] !== "constructor") methods.add(m[1]);
    }
    const fields = new Set([...body.join("\n").matchAll(/this\.([A-Za-z_$][\w$]*)\s*=(?!=)/g)].map((m) => m[1]));
    classes.push({ name: head[1], methods, fields });
    i = end;
  }
  return classes;
}

test("no view class assigns a field with the name of one of its methods", () => {
  // A field written in init hides the method of the same name, so a handler
  // calling the method throws.
  const clashes = [];
  for (const f of VIEWS) {
    for (const c of classesOf(source(f))) {
      for (const name of c.fields) if (c.methods.has(name)) clashes.push(`${f}: ${c.name}.${name}`);
    }
  }
  assert.deepEqual(clashes, []);
});
test("the class scan reads methods and fields", () => {
  const dialog = classesOf(source("skill-dialog.js")).find((c) => c.name === "SkillDialog");
  assert.ok(dialog.methods.has("render") && dialog.methods.has("close") && dialog.methods.has("deleteClicked"));
  assert.ok(dialog.fields.has("tab") && dialog.fields.has("closed") && dialog.fields.has("armed"));
  assert.deepEqual(classesOf("class A {\n  get x() {}\n  y() { this.x = 1; }\n}\n").map((c) => [...c.fields].filter((n) => c.methods.has(n))), [["x"]]);
  const names = VIEWS.flatMap((f) => classesOf(source(f)).map((c) => c.name)).sort();
  assert.deepEqual(names, ["DiscoverTab", "InstalledTab", "MachineData", "MachinesTab", "Panel", "SkillDialog", "SkillsGate", "Toggle"]);
});
