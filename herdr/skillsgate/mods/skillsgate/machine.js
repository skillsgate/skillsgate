// Operations on one machine. `exec` and `readText` are Herdr's functions,
// passed in by main.js (and faked in tests), so this file imports no Herdr code.
import { TOOLS, UNIVERSAL } from "./registry.js";
import { LINK, REMOVE, UNLINK, scanScript } from "./scripts.js";
import { buildSkills, parseScan, relativePath, toolByName } from "./model.js";

const SCAN_TIMEOUT_MS = 30000;
const OP_TIMEOUT_MS = 30000;

const lastLine = (text) =>
  String(text ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .pop();

const failure = (r) => ({ ok: false, error: lastLine(r.stderr) || `Exited with code ${r.code}` });
const changed = (skill) => ({ ok: false, error: `"${skill.name}" changed on disk. Refresh and try again.` });
const universalHolds = (skill) => ({
  ok: false,
  error: `Universal holds the shared copy of "${skill.name}". Delete the skill to remove it everywhere.`,
});

export function createMachine({ exec, tools = TOOLS }) {
  async function scan(on) {
    const r = await exec(scanScript(tools), [], on, SCAN_TIMEOUT_MS);
    if (r.code !== 0) return failure(r);
    try {
      const parsed = parseScan(r.stdout);
      return { ok: true, scan: parsed, skills: buildSkills(parsed) };
    } catch {
      return { ok: false, error: "Unreadable scan" };
    }
  }

  // Adds a shared-store skill to a tool's folder as a relative symlink.
  async function link(on, scanResult, skill, toolName) {
    if (skill.home !== "store") return { ok: false, error: "Only skills in the shared store can be added to other tools" };
    if (toolName === UNIVERSAL) return universalHolds(skill);
    const tool = toolByName(tools, toolName);
    const scanned = scanResult.tools.find((t) => t.name === toolName);
    if (!tool || !scanned?.dir) return { ok: false, error: `Unknown tool "${toolName}"` };
    const target = relativePath(scanned.dir, skill.real);
    const r = await exec(LINK, [scanned.dir, skill.folder, target], on, OP_TIMEOUT_MS);
    if (r.code === 0) return { ok: true };
    if (r.code === 3) return { ok: false, error: `A different copy of "${skill.folder}" is already in ${tool.displayName}` };
    if (r.code === 5) return { ok: false, error: `Could not link "${skill.folder}" into ${tool.displayName}` };
    return failure(r);
  }

  // Removes a tool's symlink to a skill; the skill itself stays.
  async function unlink(on, skill, toolName) {
    if (toolName === UNIVERSAL) return universalHolds(skill);
    const tool = toolByName(tools, toolName);
    if (!tool) return { ok: false, error: `Unknown tool "${toolName}"` };
    const own = skill.entries.filter((e) => e.tool === toolName);
    if (own.some((e) => !e.link)) {
      return { ok: false, error: `${tool.displayName} holds its own copy of "${skill.name}". Delete the skill to remove it.` };
    }
    for (const entry of own) {
      const r = await exec(UNLINK, [entry.path, skill.real], on, OP_TIMEOUT_MS);
      if (r.code === 3) return changed(skill);
      if (r.code !== 0) return failure(r);
    }
    return { ok: true };
  }

  // Deletes a skill's folder (unless it lives outside every tool folder) and
  // every link that leads to it.
  async function remove(on, scanResult, skill) {
    let base = "-"; // no base folder: only the links go, never the folder
    if (skill.home !== "external") {
      const holding = scanResult.tools
        .map((t) => t.dir)
        .filter((dir) => dir && skill.real.startsWith(dir + "/"))
        .sort((a, b) => b.length - a.length);
      if (!holding.length) return changed(skill);
      base = holding[0];
    }
    const links = skill.entries.filter((e) => e.link).map((e) => e.path);
    const r = await exec(REMOVE, [skill.real, base, ...links], on, OP_TIMEOUT_MS);
    if (r.code === 0) return { ok: true };
    if (r.code === 4) return changed(skill);
    return failure(r);
  }

  return { scan, link, unlink, remove };
}
