// Pure functions: parsing the scan output and grouping it into skills.
import { UNIVERSAL } from "./registry.js";

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
const encoder = new TextEncoder();
const tooLarge = (text) => encoder.encode(text).length > LOCK_LIMIT;

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
