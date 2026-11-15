import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
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

// ---- The registry's folders, read from the desktop app's source ----
//
// The desktop app writes each tool's folders as TypeScript:
//   globalSkillsDir: path.join(home, ".cursor", "skills"),
//   detectInstalled: () => dirExists(path.join(home, ".cursor")),
// This reads those expressions and writes them as the `sh` expressions the
// registry uses. It knows only the shapes the app uses today and throws on any
// other, so a new shape fails the test instead of being skipped.

// The expression's tokens: names (dotted), strings, and punctuation.
function tokens(text) {
  const out = [];
  const re = /\s+|\/\/[^\n]*|("(?:[^"\\]|\\.)*")|([A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*)|(\|\||=>|[(),])|(.)/g;
  for (const m of text.matchAll(re)) {
    if (m[1]) out.push({ type: "string", value: JSON.parse(m[1]) });
    else if (m[2]) out.push({ type: "name", value: m[2] });
    else if (m[3]) out.push({ type: "punct", value: m[3] });
    else if (m[4]) throw new Error(`unexpected "${m[4]}" in: ${text}`);
  }
  return out;
}

// Reads one TypeScript expression from `text` and returns what `read(p)` makes
// of it, where `p` gives the parse steps below; throws unless every token is used.
function parse(text, read) {
  const list = tokens(text);
  let i = 0;
  const p = {
    // Whether the next token is this name or punctuation (never a string).
    peek: (value) => list[i] !== undefined && list[i].type !== "string" && list[i].value === value,
    type: () => list[i]?.type,
    take(value) {
      if (!p.peek(value)) throw new Error(`expected "${value}" at "${list[i]?.value}" in: ${text}`);
      i++;
    },
    next(type) {
      if (list[i]?.type !== type) throw new Error(`expected a ${type} at "${list[i]?.value}" in: ${text}`);
      return list[i++].value;
    },
  };
  const value = read(p);
  if (i !== list.length) throw new Error(`unread "${list[i].value}" in: ${text}`);
  return value;
}

// A path expression as `sh`: path.join(a, "b") is a/b, `process.env.X || e` is
// ${X:-e}, and a name is what `names` maps it to.
function shPath(p, names) {
  let left;
  if (p.peek("path.join")) {
    p.take("path.join");
    p.take("(");
    const parts = [shPath(p, names)];
    while (p.peek(",")) {
      p.take(",");
      if (p.peek(")")) break; // a trailing comma
      parts.push(shPath(p, names));
    }
    p.take(")");
    left = parts.join("/");
  } else if (p.peek("(")) {
    p.take("(");
    left = shPath(p, names);
    p.take(")");
  } else if (p.type() === "string") {
    left = p.next("string");
  } else {
    const name = p.next("name");
    if (name.startsWith("process.env.")) {
      const variable = name.slice("process.env.".length);
      if (!/^[A-Z_][A-Z0-9_]*$/.test(variable) || !p.peek("||")) throw new Error(`process.env.${variable} without a fallback`);
      p.take("||");
      return `\${${variable}:-${shPath(p, names)}}`;
    }
    if (!Object.hasOwn(names, name)) throw new Error(`unknown name "${name}"`);
    left = names[name];
  }
  if (p.peek("||")) throw new Error("|| after something other than process.env");
  return left;
}

// detectInstalled as a list of `sh` folders: one dirExists, several awaited
// dirExists joined by ||, or `async () => true` (always present: $HOME).
function shDetect(p, names) {
  const isAsync = p.peek("async");
  if (isAsync) p.take("async");
  p.take("(");
  p.take(")");
  p.take("=>");
  if (isAsync && p.peek("true")) {
    p.take("true");
    return ["$HOME"];
  }
  const one = () => {
    p.take("dirExists");
    p.take("(");
    const dir = shPath(p, names);
    p.take(")");
    return dir;
  };
  if (!isAsync) return [one()];
  const dirs = [];
  do {
    if (dirs.length) p.take("||");
    p.take("(");
    p.take("await");
    dirs.push(one());
    p.take(")");
  } while (p.peek("||"));
  return dirs;
}

// The desktop app's registry as `{ name, dir, detect }`, in order, with its
// folder names (home, configHome, ...) read from their definitions.
function desktopFolders(src) {
  if (!/\nconst home = os\.homedir\(\)\n/.test(src)) throw new Error("home is not os.homedir()");
  const names = { home: "$HOME" };
  for (const name of ["configHome", "factoryHome", "ob1Home"]) {
    const m = new RegExp(`\\nconst ${name} = ([^\\n]+)\\n`).exec(src);
    if (!m) throw new Error(`no definition of ${name}`);
    names[name] = parse(m[1], (p) => shPath(p, names));
  }
  const block = src.slice(src.indexOf("const agentRegistry"), src.indexOf("// Canonical skill storage"));
  const entry = /\n {2}(?:"[^"]+"|[A-Za-z][\w-]*): \{\n {4}name: "([^"]+)",\n {4}displayName: "[^"]+",\n {4}shortCode: "[^"]+",\n {4}globalSkillsDir: ([\s\S]*?),\n {4}detectInstalled: ([\s\S]*?),?\n {2}\},/g;
  const tools = [...block.matchAll(entry)].map(([, name, dir, detect]) => ({
    name,
    dir: parse(dir, (p) => shPath(p, names)),
    detect: parse(detect, (p) => shDetect(p, names)),
  }));
  // Every entry was read: an entry of any other shape fails here.
  const keys = [...block.matchAll(/\n {4}name: "/g)].length;
  if (tools.length !== keys) throw new Error(`read ${tools.length} of ${keys} entries`);
  return tools;
}

test("the registry's folders and detect folders match the desktop app's, for every tool", () => {
  const desktop = desktopFolders(readFileSync("apps/desktop/src/main/ipc-handlers.ts", "utf8"));
  assert.equal(desktop.length, 25);
  assert.deepEqual(
    TOOLS.map(({ name, dir, detect }) => ({ name, dir, detect })),
    desktop,
  );
});
test("the folder comparison catches a changed folder and fails on a shape it does not know", () => {
  const src = readFileSync("apps/desktop/src/main/ipc-handlers.ts", "utf8");
  const mine = (from, to) => {
    assert.ok(src.includes(from), from);
    return src.replace(from, to);
  };
  const compare = (text) => assert.deepEqual(TOOLS.map(({ name, dir, detect }) => ({ name, dir, detect })), desktopFolders(text));
  // A different folder or detect folder no longer matches.
  assert.throws(() => compare(mine('path.join(home, ".cursor", "skills")', 'path.join(home, ".cursor", "skillz")')), /skillz/);
  assert.throws(() => compare(mine('dirExists(path.join(home, ".amp"))', 'dirExists(path.join(home, ".ampx"))')), /ampx/);
  assert.throws(() => compare(mine('const configHome = process.env.XDG_CONFIG_HOME || path.join(home, ".config")', 'const configHome = path.join(home, ".cfg")')), /\.cfg/);
  // Shapes the reader does not know: each throws, nothing is skipped.
  for (const [from, to] of [
    ['globalSkillsDir: path.join(home, ".cline", "skills")', 'globalSkillsDir: resolveHome(".cline", "skills")'],
    ['detectInstalled: () => dirExists(path.join(home, ".trae"))', 'detectInstalled: () => fileExists(path.join(home, ".trae"))'],
    ['detectInstalled: () => dirExists(path.join(home, ".zcode"))', 'detectInstalled: () => dirExists(path.join(home, ".zcode")) && true'],
    ['shortCode: "GO",\n', 'shortCode: "GO",\n    hidden: true,\n'],
    ['path.join(home, ".junie", "skills")', 'path.join(os.tmpdir(), ".junie", "skills")'],
  ]) {
    assert.throws(() => desktopFolders(mine(from, to)), Error, to);
  }
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
const LOGIC = ["registry.js", "scripts.js", "model.js", "view-model.js", "machine.js", "catalog.js", "channel.js", "requests.js"];
const VIEWS = [
  "main.js",
  "host.js",
  "ui.js",
  "toggle.js",
  "panel.js",
  "installed-tab.js",
  "discover-tab.js",
  "machines-tab.js",
  "skill-dialog.js",
  "catalog-dialog.js",
];
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
  assert.deepEqual(names, ["CatalogDialog", "DiscoverTab", "InstalledTab", "MachineData", "MachinesTab", "Panel", "SkillDialog", "SkillsGate", "Toggle"]);
});

test("the share folder is complete", () => {
  for (const f of ["RECIPE.md", "README.md", "preview.png", "mods/skillsgate/main.js", "mods/skillsgate/mod.json", "mods/skillsgate/mark.svg"])
    assert.ok(existsSync(`herdr/skillsgate/${f}`), f);
  const recipe = readFileSync("herdr/skillsgate/RECIPE.md", "utf8");
  for (const h of ["## What you see", "## How it behaves", "## Built from", "## Watch out", "## Done when"]) assert.ok(recipe.includes(h), h);
  assert.ok(recipe.includes("![SkillsGate](preview.png)"));
  assert.ok(recipe.includes('"id": "skillsgate-toggle"') && recipe.includes('"id": "skillsgate-panel"'));
});
