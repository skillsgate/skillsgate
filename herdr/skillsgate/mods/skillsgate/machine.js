// Operations on one machine. `exec` and `readText` are Herdr's functions,
// passed in by main.js (and faked in tests), so this file imports no Herdr code.
import { TOOLS } from "./registry.js";
import { scanScript } from "./scripts.js";
import { buildSkills, parseScan } from "./model.js";

const SCAN_TIMEOUT_MS = 30000;

const lastLine = (text) =>
  String(text ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .pop();

export function createMachine({ exec, tools = TOOLS }) {
  async function scan(on) {
    const r = await exec(scanScript(tools), [], on, SCAN_TIMEOUT_MS);
    if (r.code !== 0) return { ok: false, error: lastLine(r.stderr) || `Exited with code ${r.code}` };
    try {
      const parsed = parseScan(r.stdout);
      return { ok: true, scan: parsed, skills: buildSkills(parsed) };
    } catch {
      return { ok: false, error: "Unreadable scan" };
    }
  }
  return { scan };
}
