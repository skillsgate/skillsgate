// Operations on one machine. `exec` and `readText` are built on Herdr's
// functions by adaptExec and adaptReadText below (host.js passes Herdr's in;
// tests pass fakes), so this file imports no Herdr code. `readText(path, on)`
// resolves the text, resolves null ONLY when the file is absent, and rejects
// on any other failure.
import { TOOLS, UNIVERSAL } from "./registry.js";
import { INSTALL, LINK, REMOVE, UNLINK, WRITE, scanScript } from "./scripts.js";
import {
  buildSkills,
  dropFromLock,
  lockPath,
  machineInSentence,
  mergeLock,
  parseScan,
  relativePath,
  sanitizeName,
  toolByName,
  withoutHerdrPrefix,
} from "./model.js";
import { cloneUrl as githubCloneUrl, validSkillId, validSource } from "./catalog.js";

const SCAN_TIMEOUT_MS = 30000;
const OP_TIMEOUT_MS = 30000;
const INSTALL_TIMEOUT_MS = 120000;

// The folder an install creates; the script checks the same things again.
const unsafeFolder = (folder) =>
  !folder || folder === "." || folder === ".." || folder.includes("/") || folder.startsWith(".") || folder.startsWith("-");

const lastLine = (text) =>
  String(text ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .pop();

const failure = (r) => ({ ok: false, error: lastLine(r.stderr) || `Exited with code ${r.code}` });

// The host adapters, built on Herdr's functions (host.js passes them in). Each
// drops Herdr's "`herdr.exec`: " from an error once, here, so no notice or
// view shows it.
// exec(script, args, on, timeout) runs `script` with sh on machine `on` (null:
// this computer) and never rejects: a program that can't start or a machine
// that can't be reached comes back as code -1 with the reason in stderr.
export const adaptExec = (hostExec) => (script, args, on, timeout) =>
  Promise.resolve()
    .then(() => hostExec("sh", ["-c", script, "skillsgate", ...args], { on, timeout }))
    .catch((error) => ({ code: -1, stdout: "", stderr: withoutHerdrPrefix(error?.message ?? error) }));
// readText(path, on) resolves the text, null ONLY when the file is absent, and
// rejects on any other failure, as Herdr's readTextFile does.
export const adaptReadText = (readTextFile) => (path, on) =>
  Promise.resolve()
    .then(() => readTextFile(path, { on }))
    .catch((error) => {
      throw new Error(withoutHerdrPrefix(error?.message ?? error));
    });
const changed = (skill) => ({ ok: false, error: `"${skill.name}" changed on disk. Refresh and try again.` });
const universalHolds = (skill) => ({
  ok: false,
  error: `Universal holds the shared copy of "${skill.name}". Delete the skill to remove it everywhere.`,
});

export function createMachine({
  exec,
  readText,
  tools = TOOLS,
  cloneUrl = githubCloneUrl,
  now = () => new Date().toISOString(),
}) {
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
    const r = await exec(LINK, [scanned.dir, skill.folder, target, skill.real], on, OP_TIMEOUT_MS);
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
    if (r.code === 4) return changed(skill);
    if (r.code !== 0) return failure(r);
    // The lock records shared-store installs only. Whatever goes wrong here is
    // not worth failing or warning about: the skill is already gone.
    if (skill.home === "store") {
      try {
        const lock = lockPath(scanResult);
        const dropped = dropFromLock(await readText(lock, on), skill.folder);
        // A rejected read throws into the catch below: nothing is written.
        if (dropped.text !== undefined) await exec(WRITE, [lock, dropped.text, "replace"], on, OP_TIMEOUT_MS);
      } catch {
        // see above
      }
    }
    return { ok: true };
  }

  // Installs a skill from a GitHub repository into the shared store, adds it to
  // the chosen tools, and records its source in the lock file. `replace` is
  // what the person was shown: true for an update of the shared-store skill of
  // that folder, false for a new install. The script replaces nothing else: a
  // new install refuses anything at all at that folder, and an update refuses
  // anything but a real skill folder there. `onStep()`, if given, is called
  // before each step that runs on the machine after the copy (each link, the
  // lock read, the lock write): the request loop refreshes the machine's lock
  // with it. A throwing onStep does not stop the install.
  async function install(on, scanResult, { source, skillId, tools: toolNames = [], replace, onStep }) {
    const step = () => {
      try {
        onStep?.();
      } catch {
        // the install goes on; the lock is the caller's concern
      }
    };
    const folder = sanitizeName(skillId);
    if (!validSource(source) || !validSkillId(skillId) || unsafeFolder(folder) || typeof replace !== "boolean") {
      return { ok: false, error: `Can't install "${skillId}" from ${source}` };
    }
    const gitMissing = { ok: false, error: `git is not installed on ${machineInSentence(on)}` };
    if (!scanResult.git) return gitMissing;
    const store = scanResult.tools.find((t) => t.name === UNIVERSAL)?.dir;
    if (!store) return { ok: false, error: `Could not find the shared skills folder on ${machineInSentence(on)}` };

    const r = await exec(INSTALL, [cloneUrl(source), skillId, store, folder, replace ? "replace" : "new"], on, INSTALL_TIMEOUT_MS);
    if (r.code === 127) return gitMissing;
    if (r.code === 3) return { ok: false, error: `"${folder}" already exists in the shared store on ${machineInSentence(on)} and was not replaced` };
    if (r.code === 2) {
      const why = lastLine(r.stderr); // git's reason, when it gave one
      return { ok: false, error: why ? `Could not download ${source}: ${why}` : `Could not download ${source}` };
    }
    if (r.code === 5) return { ok: false, error: `Could not find "${skillId}" in ${source}` };
    if (r.code === 7) return { ok: false, error: `"${skillId}" in ${source} contains symbolic links and was not installed` };
    if (r.code === 64) return { ok: false, error: `Can't install "${skillId}" from ${source}` };
    if (r.code !== 0) return failure(r);
    const real = lastLine(r.stdout);
    if (!real?.startsWith("/")) return { ok: false, error: "Unreadable install result" };

    const warnings = [];
    const installed = { key: real, real, folder, name: folder, description: "", home: "store", tools: [], entries: [] };
    for (const name of new Set(toolNames)) {
      if (name === UNIVERSAL) continue;
      const tool = toolByName(tools, name);
      if (!tool) {
        warnings.push(`Installed, but not added to ${name}: unknown tool`);
        continue;
      }
      step();
      const linked = await link(on, scanResult, installed, name);
      if (!linked.ok) warnings.push(`Installed, but not added to ${tool.displayName}: ${linked.error}`);
    }

    const notUpdated = (reason) => warnings.push(`Installed, but the skill lock was not updated (${reason})`);
    const lock = lockPath(scanResult);
    // `readText` resolves null only for an absent file and rejects on any other
    // failure; a lock that can't be read is never written over.
    let text;
    let readable = true;
    step();
    try {
      text = await readText(lock, on);
    } catch {
      readable = false;
    }
    if (!readable) {
      notUpdated("unreadable");
    } else {
      const merged = mergeLock(text, folder, source, now());
      if (merged.skip) {
        notUpdated(merged.skip);
      } else {
        // `new` refuses when a lock is there after all (we read it as absent).
        step();
        const w = await exec(WRITE, [lock, merged.text, text == null ? "new" : "replace"], on, OP_TIMEOUT_MS);
        if (w.code === 3) notUpdated("changed");
        else if (w.code === 4) notUpdated("symbolic link");
        else if (w.code !== 0) notUpdated(lastLine(w.stderr) || "could not write it");
      }
    }
    return warnings.length ? { ok: true, folder, warn: warnings.join("; ") } : { ok: true, folder };
  }

  return { scan, link, unlink, remove, install };
}
