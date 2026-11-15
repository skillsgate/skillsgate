// The body of the panel's request loop: one request a dialog posted, run on
// the machine it names. The panel only schedules it (the panel role, never a
// dialog), so node --test covers everything that changes the disk.
//
// For one request: refuse an unknown op or a malformed request without
// touching anything; take the machine's lock with the status text (a busy
// machine is refused with a warning); scan the machine under the lock, so the
// operation acts on the disk as it is now and not on an older scan (a machine
// that can't be read runs nothing); find what it acts on in that scan (a skill
// by `key`, or for an install whether its folder is already in the shared
// store); refresh the lock and run the operation; release the lock (also when
// the operation throws); re-scan; raise the machine's revision so open dialogs
// read again; and say the outcome as a notice.
//
// The lock goes stale 150 s after it was last refreshed (channel.js), longer
// than any single step on the machine. It is refreshed after the fresh scan
// and, during an install, before each step after the copy (machine.install's
// `onStep`), so it never goes stale under a running operation. The re-scan
// runs after the release and needs no lock.
//
// deps:
//   channel  createChannel(...)
//   machine  createMachine(...)
//   known(on) -> { skills } | null: the caller's latest scan, read at once and
//            only to name the skill in the lock's status text (the fresh scan
//            comes after the lock); a key it lacks is named by its folder.
//   scan(on) -> Promise<Result of machine.scan>: scans the machine now and lets
//            the caller keep the result (the panel's rows update from it).
//            Defaults to machine.scan.

import { validSkillId, validSource } from "./catalog.js";
import { machineInSentence, machineLabel, toolLabel } from "./model.js";
import { cantCheckText, inStore } from "./view-model.js";

const isRecord = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
const filled = (value) => typeof value === "string" && value !== "";
const message = (error) => String(error?.message ?? error);
const folderOf = (key) => key.slice(key.lastIndexOf("/") + 1);

// " on vps", or nothing for this computer.
const where = (on) => (on == null ? "" : ` on ${on}`);

// What each op needs, does and says. The texts get the op's subject: for the
// skill ops a skill as `{ name, home }`, for an install `{ name, updating }`.
// `tool` ops name a tool in the request. A skill linked from elsewhere keeps
// its folder when removed, so its removal never says "Deleting".
const OPS = {
  link: {
    tool: true,
    running: (s, r) => `Adding ${s.name} to ${r.label}${where(r.on)}…`,
    done: (s, r) => `Added ${s.name} to ${r.label}`,
    run: (machine, r, scan, skill) => machine.link(r.on, scan, skill, r.tool),
  },
  unlink: {
    tool: true,
    running: (s, r) => `Removing ${s.name} from ${r.label}${where(r.on)}…`,
    done: (s, r) => `Removed ${s.name} from ${r.label}`,
    run: (machine, r, _scan, skill) => machine.unlink(r.on, skill, r.tool),
  },
  remove: {
    tool: false,
    running: (s, r) =>
      s.home === "external" ? `Removing ${s.name} from all tools${where(r.on)}…` : `Deleting ${s.name}${where(r.on)}…`,
    done: (s) => (s.home === "external" ? `Removed ${s.name} from all tools` : `Deleted ${s.name}`),
    run: (machine, r, scan, skill) => machine.remove(r.on, scan, skill),
  },
  install: {
    running: (s, r) => `Installing ${s.name}${where(r.on)}…`,
    done: (s) => `${s.updating ? "Updated" : "Installed"} ${s.name}`,
    run: (machine, r, scan, _s, touch) =>
      machine.install(r.on, scan, { source: r.source, skillId: r.skillId, tools: r.tools, onStep: touch }),
  },
};

// The request in the shape the ops read, or null when it is not one this
// module runs. `on` is null for this computer or a machine's name; "" would
// share this computer's lock key while naming another machine, so it is
// refused. An install's source and skill id must pass the catalog's checks and
// its tools must be a list of names; its `name` is only shown (the skill id
// stands in for a missing one).
function readRequest(req) {
  if (!isRecord(req) || typeof req.op !== "string" || !Object.hasOwn(OPS, req.op)) return null;
  const op = OPS[req.op];
  const on = req.on === undefined ? null : req.on;
  if (on !== null && !filled(on)) return null;
  if (op === OPS.install) {
    const { source, skillId, tools } = req;
    if (!validSource(source) || !validSkillId(skillId) || !Array.isArray(tools) || !tools.every(filled)) return null;
    return { op, on, source, skillId, tools: [...tools], name: filled(req.name) ? req.name : skillId };
  }
  if (!filled(req.key)) return null;
  if (op.tool && !filled(req.tool)) return null;
  return { op, on, key: req.key, tool: op.tool ? req.tool : undefined, label: op.tool ? toolLabel(req.tool) : "" };
}

// The subject as the caller last saw it, only for the lock's status text: an
// install is named by its request; a skill by the caller's latest scan, else
// by its folder (the key is its real path) with no home. The fresh scan under
// the lock decides everything else.
function knownSubject(r, known) {
  if (r.op === OPS.install) return { name: r.name };
  let latest = null;
  try {
    latest = known?.(r.on);
  } catch {
    // named by its folder
  }
  const seen = Array.isArray(latest?.skills) ? latest.skills.find((s) => s.key === r.key) : null;
  const name = typeof seen?.name === "string" && seen.name ? seen.name : folderOf(r.key);
  return { name, home: seen?.home };
}

// What the op acts on in the fresh scan: the skill with the request's key (null
// when it is gone), or for an install whether it updates a shared-store folder.
function freshSubject(r, skills) {
  if (r.op === OPS.install) return { name: r.name, updating: inStore(skills, r.skillId) };
  return skills.find((s) => s.key === r.key) ?? null;
}

// A scan Result that never rejects.
async function scanNow(scan, on) {
  try {
    const r = await scan(on);
    return isRecord(r) ? r : { ok: false, error: "No answer" };
  } catch (error) {
    return { ok: false, error: message(error) };
  }
}

// Runs one request. Never rejects. Returns the operation's Result when it ran,
// else null (refused, busy, unreadable machine, or the skill is gone).
export async function runRequest(req, { channel, machine, known, scan = (on) => machine.scan(on) }) {
  const r = readRequest(req);
  if (!r) return null;
  const { op, on } = r;
  // Nothing is awaited before the claim, so no other request can slip in.
  if (!channel.claim(on, op.running(knownSubject(r, known), r))) {
    channel.say("warn", `${machineLabel(on)} is busy. Try again when it finishes.`);
    return null;
  }

  // Under the lock: read the machine, find the subject, operate.
  const touch = () => channel.touch(on);
  let outcome;
  try {
    const fresh = await scanNow(scan, on);
    if (!fresh.ok) {
      outcome = { unreadable: fresh.error || "No answer" };
    } else {
      const subject = freshSubject(r, Array.isArray(fresh.skills) ? fresh.skills : []);
      if (!subject) {
        outcome = { gone: true };
      } else {
        touch(); // the scan may have taken a while
        let result;
        try {
          result = await op.run(machine, r, fresh.scan, subject, touch);
        } catch (error) {
          result = { ok: false, error: message(error) };
        }
        outcome = { subject, result: isRecord(result) ? result : { ok: false, error: "No result" } };
      }
    }
  } finally {
    channel.release(on);
  }

  if (outcome.unreadable !== undefined) {
    channel.say("error", cantCheckText(on, outcome.unreadable)); // nothing changed: no bump
    return null;
  }
  if (outcome.gone) {
    channel.say("error", `That skill is no longer on ${machineInSentence(on)}.`);
    channel.bump(on); // a dialog that still shows it reads again and closes
    return null;
  }
  const { subject, result } = outcome;
  await scanNow(scan, on); // the change is done either way; a failed re-scan is the panel's to report
  channel.bump(on);
  if (!result.ok) channel.say("error", result.error || "Something went wrong");
  else if (result.warn) channel.say("warn", result.warn);
  else channel.say("done", op.done(subject, r));
  return result;
}
