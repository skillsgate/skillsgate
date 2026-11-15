// Pure decisions about what each view shows: the panel's frame and its
// Installed tab, the skill dialog, Discover and the catalog dialog. The data
// they read (scans, skills, names and labels) comes from model.js.
import { TOOLS, UNIVERSAL } from "./registry.js";
import {
  machineInSentence,
  machineKey,
  parseFrontmatter,
  sanitizeName,
  shortPath,
  stripFrontmatter,
  toolByName,
  toolLabel,
} from "./model.js";

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
