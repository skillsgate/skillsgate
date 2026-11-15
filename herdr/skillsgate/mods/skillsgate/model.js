// Pure functions: parsing the scan output, grouping it into skills, the lock
// file, and what the panel shows.
import { TOOLS, UNIVERSAL } from "./registry.js";

const RS = "\x1e"; // ends a record
const US = "\x1f"; // separates fields

const dequote = (value) => {
  const v = value.trim();
  if (v.length >= 2 && v.startsWith('"') && v.endsWith('"')) return v.slice(1, -1).replace(/\\(["\\])/g, "$1");
  if (v.length >= 2 && v.startsWith("'") && v.endsWith("'")) return v.slice(1, -1).replace(/''/g, "'");
  return v;
};

// Reads `name` and `description` from the frontmatter block at the top of a
// SKILL.md. Values may be plain, quoted, folded (`>`) or literal (`|`); a value
// that continues on indented lines is joined with single spaces.
export function parseFrontmatter(head, fallback) {
  const lines = String(head ?? "").replace(/\r\n?/g, "\n").split("\n");
  const out = { name: fallback, description: "" };
  if (lines[0].trim() !== "---") return out;
  const fields = {};
  let key = null;
  for (const line of lines.slice(1)) {
    if (line.trim() === "---") break;
    const top = /^([A-Za-z0-9_-]+):(.*)$/.exec(line);
    if (top) {
      key = top[1];
      fields[key] = [top[2].trim()];
    } else if (key && /^\s+\S/.test(line)) {
      fields[key].push(line.trim());
    } else if (!line.trim()) {
      // a blank line inside a block ends nothing; keep the current key
    } else {
      key = null;
    }
  }
  const read = (name) => {
    const parts = fields[name];
    if (!parts) return "";
    const [first, ...rest] = parts;
    if (/^[>|][+-]?\d*$/.test(first)) return rest.join(" ").trim();
    return dequote([first, ...rest].join(" "));
  };
  out.name = read("name") || fallback;
  out.description = read("description");
  return out;
}

// Turns the scan script's stdout into `{ home, git, tools, entries }`.
export function parseScan(stdout) {
  const scan = { home: "", git: false, tools: [], entries: [] };
  let header = false;
  for (const record of String(stdout ?? "").split(RS)) {
    const f = record.split(US);
    const type = f[0].trim();
    if (type === "H" && f.length >= 3) {
      header = true;
      scan.home = f[1];
      scan.git = f[2] === "1";
    } else if (type === "T" && f.length >= 4) {
      scan.tools.push({ name: f[1], dir: f[2], detected: f[3] === "1" });
    } else if (type === "S" && f.length >= 6) {
      scan.entries.push({ tool: f[1], path: f[2], real: f[3], link: f[4] === "1", head: f[5] });
    }
  }
  if (!header) throw new Error("Unreadable scan");
  return scan;
}

const lastSlash = (path) => path.lastIndexOf("/");

// Groups scan entries by real folder into skills, sorted by name then real path.
export function buildSkills(scan) {
  const order = new Map(scan.tools.map((t, i) => [t.name, i]));
  const universalDir = scan.tools.find((t) => t.name === UNIVERSAL)?.dir;
  const toolDirs = scan.tools.map((t) => t.dir).filter(Boolean);
  const byReal = new Map();
  for (const e of scan.entries) {
    if (!byReal.has(e.real)) byReal.set(e.real, []);
    byReal.get(e.real).push(e);
  }
  const skills = [];
  for (const [real, group] of byReal) {
    group.sort((a, b) => (order.get(a.tool) ?? 0) - (order.get(b.tool) ?? 0));
    const folder = real.slice(lastSlash(real) + 1);
    const { name, description } = parseFrontmatter(group[0].head, folder);
    const parent = real.slice(0, lastSlash(real));
    let home = "external";
    if (universalDir && parent === universalDir) home = "store";
    else if (toolDirs.some((dir) => real.startsWith(dir + "/"))) home = "tool";
    skills.push({
      key: real,
      real,
      folder,
      name,
      description,
      home,
      tools: [...new Set(group.map((e) => e.tool))],
      entries: group.map((e) => ({ tool: e.tool, path: e.path, link: e.link })),
    });
  }
  const lower = (s) => s.name.toLowerCase();
  skills.sort((a, b) => (lower(a) < lower(b) ? -1 : lower(a) > lower(b) ? 1 : a.real < b.real ? -1 : a.real > b.real ? 1 : 0));
  return skills;
}

// Same rule as the desktop app: lower case, every run outside [a-z0-9._]
// becomes one "-", and leading and trailing "-" are trimmed.
export function sanitizeName(name) {
  return String(name ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9._]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// The relative path that leads from folder `fromDir` to `toPath`; both absolute
// and already real. A symlink made with it keeps working if the home moves.
export function relativePath(fromDir, toPath) {
  const from = fromDir.split("/").filter(Boolean);
  const to = toPath.split("/").filter(Boolean);
  let shared = 0;
  while (shared < from.length && shared < to.length && from[shared] === to[shared]) shared++;
  return [...from.slice(shared).map(() => ".."), ...to.slice(shared)].join("/");
}

export const toolByName = (tools, name) => tools.find((tool) => tool.name === name);

// `on` is a machine's name, or null for this computer.
export const machineKey = (on) => on ?? "";
export const machineLabel = (on) => on ?? "This computer";

// The lock file the desktop app also reads and writes.
export const lockPath = (scan) => scan.home + "/.agents/.skill-lock.json";

// The lock text travels to the machine as one argument; a single argument is
// capped at 128 KiB on Linux, so a bigger lock is left alone. Counted in UTF-8
// bytes, since that is what the limit counts.
const LOCK_LIMIT = 96 * 1024;

// UTF-8 bytes of `text`, counted by hand: Herdr's QuickJS has no TextEncoder.
// A lone surrogate counts 3, as the U+FFFD that replaces it.
function utf8Length(text) {
  let n = 0;
  for (let i = 0; i < text.length; i++) {
    const c = text.charCodeAt(i);
    if (c < 0x80) n += 1;
    else if (c < 0x800) n += 2;
    else if (c >= 0xd800 && c <= 0xdbff && (text.charCodeAt(i + 1) & 0xfc00) === 0xdc00) {
      n += 4;
      i++;
    } else n += 3;
  }
  return n;
}
const tooLarge = (text) => utf8Length(text) > LOCK_LIMIT;

// Reads a lock into `{ lock }`, or `{ skip }` when it is not a version 1 lock.
// Absent or empty text is an empty lock (`empty: true`).
function readLock(text) {
  if (text == null || String(text).trim() === "") return { lock: { version: 1, skills: {} }, empty: true };
  let lock;
  try {
    lock = JSON.parse(text);
  } catch {
    return { skip: "invalid" };
  }
  const plain = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
  if (!plain(lock) || lock.version !== 1 || !plain(lock.skills)) return { skip: "invalid" };
  return { lock };
}

// Records a GitHub install in the lock, keeping `installedAt` of an existing
// entry. Returns `{ text }` to write, or `{ skip }` when the file must be left
// exactly as it is.
export function mergeLock(text, folder, source, now) {
  const read = readLock(text);
  if (read.skip) return { skip: read.skip };
  const { lock } = read;
  const previous = Object.hasOwn(lock.skills, folder) ? lock.skills[folder] : null;
  const installedAt = typeof previous?.installedAt === "string" ? previous.installedAt : now;
  lock.skills[folder] = { source, sourceType: "github", originalUrl: source, skillFolderHash: "", installedAt, updatedAt: now };
  const out = JSON.stringify(lock, null, 2);
  if (tooLarge(out)) return { skip: "large" };
  return { text: out };
}

// Removes a skill's entry. `{ skip: "absent" }` means there is nothing to change.
export function dropFromLock(text, folder) {
  const read = readLock(text);
  if (read.skip) return { skip: read.skip };
  if (read.empty || !Object.hasOwn(read.lock.skills, folder)) return { skip: "absent" };
  delete read.lock.skills[folder];
  const out = JSON.stringify(read.lock, null, 2);
  if (tooLarge(out)) return { skip: "large" };
  return { text: out };
}

// ---- What the panel shows ----

// The machine the panel views. `pref` is the stored choice
// (`{ follow, on }`); anything but an explicit `follow: false` follows the
// shown space's machine.
export function effectiveMachine(pref, shownSpaceMachine) {
  const chosen = pref !== null && typeof pref === "object" && pref.follow === false;
  if (chosen) return typeof pref.on === "string" ? pref.on : null;
  return typeof shownSpaceMachine === "string" ? shownSpaceMachine : null;
}

// By name without case, then by UTF-16 code unit so the order is total. Not
// localeCompare: Herdr's runtime has no Intl and its localeCompare ignores
// options, so the order would differ between node and Herdr.
function byName(a, b) {
  const x = a.toLowerCase();
  const y = b.toLowerCase();
  if (x !== y) return x < y ? -1 : 1;
  return a < b ? -1 : a > b ? 1 : 0;
}

// This computer (null) first, then every machine Herdr knows or a space lives
// on, once each, by name.
export function machineNames(machines, spaces) {
  const names = new Set();
  for (const m of machines ?? []) if (typeof m?.name === "string") names.add(m.name);
  for (const s of spaces ?? []) if (typeof s?.machine === "string") names.add(s.machine);
  return [null, ...[...names].sort(byName)];
}

// Whether Herdr's `machines()` reports the machine with this machine key as
// unavailable (offline, or its layout could not be read).
export function machineUnavailable(machines, key) {
  return (machines ?? []).some((m) => machineKey(m?.name) === key && m.layout === "unavailable");
}

// The layout node with this id, searched depth first, or null.
export function layoutNode(node, id) {
  if (node?.id === id) return node;
  for (const child of node?.children ?? []) {
    const found = layoutNode(child, id);
    if (found) return found;
  }
  return null;
}

// The chip that filters the list: the chosen tool while this machine has a
// chip for it, else null (All).
export function activeTool(chips, tool) {
  return tool && chips.some((c) => c.name === tool) ? tool : null;
}

// What the Installed tab shows for a machine's state: its rows (or the empty
// state) once any scan worked, even if a later one failed; the error only
// while there has never been a good scan; skeleton rows until the first result.
export function installedBody(state) {
  if (state?.skills) return state.skills.length ? "rows" : "empty";
  return state?.error ? "error" : "skeleton";
}

// "this computer" or the machine's name, inside a sentence.
export const machineInSentence = (on) => (on == null ? "this computer" : machineLabel(on));
const inSentence = machineInSentence;

// "Can't check vps: <error>": a machine whose scan failed.
export const cantCheckText = (on, error) => `Can't check ${inSentence(on)}: ${error}`;

// The notice for a failed scan, given the machine's state before the result:
// only when it had a good scan (otherwise the error view says it) and only
// when the error is new or changed, so a repeating failure is said once.
export function scanNotice(on, before, error) {
  if (!before?.skills || before.error === error) return null;
  return cantCheckText(on, error);
}

// `query` matches a skill's name, folder or description, ignoring case;
// `tool` keeps the skills that tool has.
export function filterSkills(skills, { query, tool } = {}) {
  const q = String(query ?? "").trim().toLowerCase();
  return skills.filter((s) => {
    if (tool && !s.tools.includes(tool)) return false;
    if (!q) return true;
    return [s.name, s.folder, s.description].some((text) => String(text ?? "").toLowerCase().includes(q));
  });
}

const SECTIONS = [
  { id: "store", title: "SHARED" },
  { id: "tool", title: "IN ONE TOOL" },
  { id: "external", title: "LINKED FROM ELSEWHERE" },
];

// The Installed list's groups, in a fixed order, leaving out empty ones.
export function sections(skills) {
  return SECTIONS.map(({ id, title }) => ({ id, title, rows: skills.filter((s) => s.home === id) })).filter((s) => s.rows.length > 0);
}

// One chip per tool that has at least one skill, in registry order (the scan
// lists its tools in registry order).
export function toolChips(scan, skills) {
  const chips = [];
  for (const { name } of scan?.tools ?? []) {
    const count = skills.filter((s) => s.tools.includes(name)).length;
    if (count === 0) continue;
    const tool = toolByName(TOOLS, name);
    chips.push({ name, displayName: tool?.displayName ?? name, shortCode: tool?.shortCode ?? "", count });
  }
  return chips;
}

// A tool's name as the panel prints it: the display name without a trailing
// note in parentheses ("Universal (.agents/skills)" reads "Universal").
export function toolLabel(name) {
  const displayName = toolByName(TOOLS, name)?.displayName ?? name;
  return displayName.replace(/\s*\([^)]*\)$/, "");
}

const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;

// A row's right side: the one tool's name, or how many tools have the skill.
export function toolSummary(skill) {
  return skill.tools.length === 1 ? toolLabel(skill.tools[0]) : plural(skill.tools.length, "tool");
}

// "42 skills · 12 tools": the tools counted are the ones with a skill.
export function summaryText(scan, skills) {
  return `${plural(skills.length, "skill")} · ${plural(toolChips(scan, skills).length, "tool")}`;
}

// The footer's text for a machine's state `{ scan, skills, at, loading }`.
export function footerText(state, now) {
  if (!state?.scan) return state?.loading ? "Checking…" : "";
  return `${summaryText(state.scan, state.skills)} · checked ${ago(now - state.at)}`;
}

export function emptyText(on) {
  return `No skills on ${inSentence(on)} yet`;
}

// A done notice shows for 4 s, a warning or an error for 8 s.
export function noticeShown(notice, now) {
  if (!notice || typeof notice.text !== "string" || !notice.text || typeof notice.at !== "number") return false;
  return now - notice.at < (notice.kind === "done" ? 4000 : 8000);
}

// What the status line shows: work running on the machine (`busy`, its lock
// text), else a notice that has not run out, else nothing (null).
export function statusOf(busy, notice, now) {
  if (busy) return { kind: "busy", text: busy };
  return noticeShown(notice, now) ? { kind: notice.kind, text: notice.text } : null;
}

// The parts of the panel that can change with the clock alone, exactly as
// they are drawn: the footer text and the status line (a notice runs out; a
// stale lock's busy text drops). A notice hidden behind busy text is not drawn.
export function clockRegions(state, busy, notice, now) {
  return { footer: footerText(state, now), status: statusOf(busy, notice, now) };
}

// Whether the panel's clock tick has anything new to draw. Herdr redraws the
// whole window on every notify, so the tick notifies only when this is true.
export function regionsChanged(drawn, next) {
  if (!drawn) return true;
  const same = (a, b) => (a === null ? b === null : b !== null && a.kind === b.kind && a.text === b.text);
  return drawn.footer !== next.footer || !same(drawn.status, next.status);
}

// `path` with the home folder written as `~`.
export function shortPath(path, home) {
  const base = String(home ?? "").replace(/\/+$/, "");
  if (!base) return path;
  if (path === base) return "~";
  return path.startsWith(base + "/") ? "~" + path.slice(base.length) : path;
}

// ---- What the skill dialog shows ----

// The Tools tab's rows for a skill: every tool the machine has (detected),
// plus any tool that already has the skill, in registry order (the scan lists
// its tools so). `control` is what the row ends with: "switch" for a skill in
// the shared store, "shared" for Universal holding that skill's shared copy,
// "none" for every row of a skill outside the store (toolsNote says why).
// `wanted` (`{ tool, on }`, while requestPending) shows that tool's switch
// where the person put it until the outcome is read.
export function toolRows(scan, skill, wanted = null) {
  const rows = [];
  for (const { name, detected } of scan?.tools ?? []) {
    const has = skill.tools.includes(name);
    if (!detected && !has) continue;
    const tool = toolByName(TOOLS, name);
    let control = "none";
    if (skill.home === "store") control = name === UNIVERSAL ? "shared" : "switch";
    const on = wanted?.tool === name && typeof wanted.on === "boolean" ? wanted.on : has;
    rows.push({ name, label: toolLabel(name), shortCode: tool?.shortCode ?? "", program: tool?.program ?? null, on, control });
  }
  return rows;
}

// A tool's mark from Herdr's program table (knownAgents()): `{ icon, tint }`
// for the program whose key is the tool's `program`, or null to draw the
// two-letter badge (no program, no icon, or the list is loading or failed).
export function toolMark(programs, program) {
  if (!program || !Array.isArray(programs)) return null;
  const found = programs.find((p) => p?.key === program);
  return typeof found?.icon === "string" && found.icon ? { icon: found.icon, tint: Boolean(found.tint) } : null;
}

// Whether a request the dialog sent (`{ rev, at }`: the machine's revision
// and the time when it was sent) still waits for its outcome. It is answered
// once the dialog has read the machine again after the panel raised the
// revision (`readRev`: the revision the dialog's last finished read began
// at), or, with the machine not busy, when a notice came after it with no
// change (the request was refused). After 150 s, as for a stale lock, it is
// given up.
export function requestPending(sent, { rev, readRev, notice, busy, now }) {
  if (!sent) return false;
  if (now - sent.at > 150000) return false;
  if (readRev > sent.rev) return false;
  if (!busy && rev === sent.rev && typeof notice?.at === "number" && notice.at >= sent.at) return false;
  return true;
}

const ONLY_STORE = "Only skills in the shared store can be added to other tools.";

// Why a skill outside the shared store has no switches, or null for a skill in it.
export function toolsNote(scan, skill) {
  if (skill.home === "store") return null;
  if (skill.home === "external") {
    return `${ONLY_STORE} This one is linked from ${shortPath(skill.real, scan?.home)}, outside every skills folder.`;
  }
  // The tool whose folder holds it: the longest tool folder around it.
  const holder = (scan?.tools ?? [])
    .filter((t) => t.dir && skill.real.startsWith(t.dir + "/"))
    .sort((a, b) => b.dir.length - a.dir.length)[0];
  const owner = holder ? `${toolLabel(holder.name)}'s` : "a tool's";
  return `${ONLY_STORE} This one lives in ${owner} own skills folder.`;
}

// The footer's delete button. The first click arms it; a skill linked from
// elsewhere keeps its folder, so it is only removed from the tools.
export function deleteLabel(skill, armed) {
  if (armed) return "Click again to delete";
  return skill.home === "external" ? "Remove from all tools" : "Delete skill";
}

// SKILL.md without its frontmatter block and the blank lines after it, with
// line ends as "\n". The block is the one parseFrontmatter reads: a first line
// "---" and a later line "---". Text without a closed block is left whole.
export function stripFrontmatter(text) {
  const lines = String(text ?? "").replace(/^﻿/, "").replace(/\r\n?/g, "\n").split("\n");
  if (lines[0].trim() !== "---") return lines.join("\n");
  const end = lines.findIndex((line, i) => i > 0 && line.trim() === "---");
  if (end < 0) return lines.join("\n");
  let start = end + 1;
  while (start < lines.length - 1 && !lines[start].trim()) start++;
  return lines.slice(start).join("\n");
}

// What the Document tab shows for a read of SKILL.md (`{ text }`, text null
// when the file is absent, or `{ error }`): the body to render, or a message.
export function skillDocument(read) {
  if (read?.error !== undefined) return { message: `Couldn't read SKILL.md: ${read.error}` };
  if (typeof read?.text !== "string") return { message: "This folder has no SKILL.md." };
  return { body: stripFrontmatter(read.text) };
}

// ---- What Discover and the catalog dialog show ----

// "950", "229.7k", "1.2M": tenths counted with integers, by hand, because
// Herdr's runtime has no Intl and its toLocaleString does not group digits.
export function formatInstalls(n) {
  const count = Math.max(0, Math.round(Number(n) || 0));
  if (count < 1000) return String(count);
  const thousands = Math.round(count / 100); // in tenths of a thousand
  const [tenths, unit] = thousands < 10000 ? [thousands, "k"] : [Math.round(count / 100000), "M"];
  const rest = tenths % 10;
  return `${Math.floor(tenths / 10)}${rest ? "." + rest : ""}${unit}`;
}

// The folders the shared store holds (skills whose home is "store").
export const installedFolders = (skills) => new Set((skills ?? []).filter((s) => s.home === "store").map((s) => s.folder));

// Whether the shared store already has the folder an install of `skillId`
// makes (sanitizeName(skillId)): the install is then an update.
export const inStore = (skills, skillId) => {
  const folder = sanitizeName(skillId);
  return Boolean(folder) && installedFolders(skills).has(folder);
};

// The tools an install goes to before any is remembered for the machine:
// every detected tool that already has a skill, minus Universal.
export function defaultTargets(scan, skills) {
  return (scan?.tools ?? [])
    .filter((t) => t.detected && t.name !== UNIVERSAL && (skills ?? []).some((s) => s.tools.includes(t.name)))
    .map((t) => t.name);
}

// What a query searches for: the trimmed text, or "" (the popular list, which
// the catalog searches as `skill`) under two characters.
export function searchKey(query) {
  const trimmed = String(query ?? "").trim();
  return trimmed.length < 2 ? "" : trimmed;
}

// What the Discover body shows. `last` is the latest search outcome kept
// (`{ key, results }` or `{ key, error }`), or null before the first; `key` is
// the field's. A newer search keeps the last outcome on screen, labelled by
// its own key, until its result arrives.
export function discoverView(last, key) {
  const label = (last ? last.key : key) === "" ? "POPULAR" : "RESULTS";
  if (!last) return { body: "searching", label, message: null };
  if (typeof last.error === "string") return { body: "error", label, message: last.error };
  if (last.results.length) return { body: "results", label, message: null };
  return { body: "empty", label, message: last.key ? `No skills found for "${last.key}"` : "No skills found" };
}

const stringOr = (value) => (typeof value === "string" ? value : "");

// A row per search result: the name, `owner/repo`, the installs, and whether
// the viewed machine's shared store has it (`skills` is null until read).
export function catalogRows(results, skills) {
  const folders = installedFolders(skills);
  return (results ?? []).map((r) => {
    const installable = Boolean(r.installable);
    return {
      name: stringOr(r.name) || stringOr(r.skillId) || "Unnamed skill",
      source: stringOr(r.source),
      installs: formatInstalls(r.installs),
      installed: installable && folders.has(sanitizeName(r.skillId)),
      installable,
    };
  });
}

const isRecord = (value) => value !== null && typeof value === "object" && !Array.isArray(value);

// The tools the dialog starts with checked: those remembered for the machine
// (`stored` is shared "skillsgate.targets.v1"), else defaultTargets.
export function startTargets(stored, on, scan, skills) {
  const kept = isRecord(stored) ? stored[machineKey(on)] : undefined;
  if (!Array.isArray(kept)) return defaultTargets(scan, skills);
  return kept.filter((name) => typeof name === "string" && name !== "");
}

// The stored choices with this machine's replaced, as a new object.
export const withTargets = (stored, on, tools) => ({ ...(isRecord(stored) ? stored : {}), [machineKey(on)]: [...tools] });

// The dialog's checklist: the machine's detected tools except Universal (the
// shared store always gets the skill), in registry order. A remembered tool
// that is not listed is never installed to.
export function checklist(scan, checked) {
  const picked = new Set(checked ?? []);
  return (scan?.tools ?? [])
    .filter((t) => t.detected && t.name !== UNIVERSAL)
    .map(({ name }) => {
      const tool = toolByName(TOOLS, name);
      return { name, label: toolLabel(name), shortCode: tool?.shortCode ?? "", program: tool?.program ?? null, checked: picked.has(name) };
    });
}

// The line under the checklist.
export function storeNote(scan) {
  const store = scan?.tools?.find((t) => t.name === UNIVERSAL)?.dir;
  return store ? `The shared store (${shortPath(store, scan.home)}) always gets a copy.` : "The shared store always gets a copy.";
}

// The catalog dialog's primary button: its label, why it is disabled (null
// when it is not) and whether that is work in progress (`working`, drawn with
// a spinner). `read` is the dialog's own scan of the machine: `{ scan, skills }`
// once one worked, `{ error }` when the first failed, `{}` while it runs.
// `busy` is the machine's lock text, or null.
export function installAction({ on, row, read, busy }) {
  const where = inSentence(on);
  const label = `${inStore(read.skills, row.skillId) ? "Update" : "Install"} on ${where}`;
  const off = (reason, working = false) => ({ label, reason, working });
  if (!row.installable) return off("This skill can't be installed");
  if (!read.scan) return read.error ? off(cantCheckText(on, read.error)) : off(`Checking ${where}…`, true);
  if (!read.scan.git) return off(`git is not installed on ${where}`);
  if (busy) return off(busy, true);
  return off(null);
}

// A catalog SKILL.md (null when it could not be fetched) as the dialog shows
// it: the frontmatter's description, then the body without the frontmatter.
export function catalogPreview(skillMd) {
  if (typeof skillMd !== "string") return { message: "Preview unavailable" };
  return { description: parseFrontmatter(skillMd, "").description, body: stripFrontmatter(skillMd) };
}

// How long ago, from elapsed milliseconds. Seconds go in steps of ten, so a
// panel showing it redraws at most every 10 s.
export function ago(ms) {
  const s = Math.floor(ms / 1000);
  if (s < 10) return "just now";
  if (s < 60) return `${Math.floor(s / 10) * 10}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  return `${Math.floor(s / 3600)}h ago`;
}
