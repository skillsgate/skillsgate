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

test("only main.js imports Herdr", () => {
  for (const f of readdirSync(MOD).filter((f) => f.endsWith(".js") && f !== "main.js"))
    assert.doesNotMatch(readFileSync(`${MOD}/${f}`, "utf8"), /from "(herdr|gpui-kit|gpui-base)"/, f);
});
