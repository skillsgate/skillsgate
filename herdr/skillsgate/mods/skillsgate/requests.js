// The body of the panel's request loop: one request a dialog posted, run on
// the machine it names. The panel only schedules it (the panel role, never a
// dialog), so node --test covers everything that changes the disk.
//
// For one request: refuse an unknown op or a malformed request without
// touching anything; take the machine's lock with the status text (a busy
// machine is refused with a warning); scan the machine under the lock, so the
// operation acts on the disk as it is now and not on an older scan (a machine
// that can't be read runs nothing); find the skill by `key` in that scan; run
// the operation; release the lock (also when the operation throws); re-scan;
// raise the machine's revision so open dialogs read again; and say the outcome
// as a notice.
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

import { cantCheckText, machineInSentence, machineLabel, toolLabel } from "./model.js";

const isRecord = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
const message = (error) => String(error?.message ?? error);
const folderOf = (key) => key.slice(key.lastIndexOf("/") + 1);

// " on vps", or nothing for this computer.
const where = (on) => (on == null ? "" : ` on ${on}`);

// What each op needs, does and says. `tool` ops name a tool in the request.
// The texts get the skill as `{ name, home }`. A skill linked from elsewhere
// keeps its folder when removed, so its removal never says "Deleting".
const OPS = {
  link: {
    tool: true,
    running: (s, tool, on) => `Adding ${s.name} to ${tool}${where(on)}…`,
    done: (s, tool) => `Added ${s.name} to ${tool}`,
    run: (machine, on, scan, skill, req) => machine.link(on, scan, skill, req.tool),
  },
  unlink: {
    tool: true,
    running: (s, tool, on) => `Removing ${s.name} from ${tool}${where(on)}…`,
    done: (s, tool) => `Removed ${s.name} from ${tool}`,
    run: (machine, on, _scan, skill, req) => machine.unlink(on, skill, req.tool),
  },
  remove: {
    tool: false,
    running: (s, _tool, on) =>
      s.home === "external" ? `Removing ${s.name} from all tools${where(on)}…` : `Deleting ${s.name}${where(on)}…`,
    done: (s) => (s.home === "external" ? `Removed ${s.name} from all tools` : `Deleted ${s.name}`),
    run: (machine, on, scan, skill) => machine.remove(on, scan, skill),
  },
};

// The request as `{ op, on, key, tool }`, or null when it is not one this
// module runs. `on` is null for this computer or a machine's name; "" would
// share this computer's lock key while naming another machine, so it is refused.
function readRequest(req) {
  if (!isRecord(req) || typeof req.op !== "string" || !Object.hasOwn(OPS, req.op)) return null;
  const op = OPS[req.op];
  const on = req.on === undefined ? null : req.on;
  if (on !== null && (typeof on !== "string" || on === "")) return null;
  if (typeof req.key !== "string" || req.key === "") return null;
  if (op.tool && (typeof req.tool !== "string" || req.tool === "")) return null;
  return { op, on, key: req.key, tool: op.tool ? req.tool : undefined };
}

// The skill as the caller last saw it (`{ name, home }`), else named by its
// folder (the key is its real path) with no home. Only for the lock's status
// text; the fresh scan under the lock decides everything else.
function knownSkill(known, on, key) {
  let latest = null;
  try {
    latest = known?.(on);
  } catch {
    // named by its folder
  }
  const seen = Array.isArray(latest?.skills) ? latest.skills.find((s) => s.key === key) : null;
  const name = typeof seen?.name === "string" && seen.name ? seen.name : folderOf(key);
  return { name, home: seen?.home };
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
  const { op, on, key, tool } = r;
  const label = tool === undefined ? "" : toolLabel(tool);
  // Nothing is awaited before the claim, so no other request can slip in.
  if (!channel.claim(on, op.running(knownSkill(known, on, key), label, on))) {
    channel.say("warn", `${machineLabel(on)} is busy. Try again when it finishes.`);
    return null;
  }

  // Under the lock: read the machine, find the skill, operate.
  let outcome;
  try {
    const fresh = await scanNow(scan, on);
    const skill = fresh.ok && Array.isArray(fresh.skills) ? fresh.skills.find((s) => s.key === key) : null;
    if (!fresh.ok) {
      outcome = { unreadable: fresh.error || "No answer" };
    } else if (!skill) {
      outcome = { gone: true };
    } else {
      let result;
      try {
        result = await op.run(machine, on, fresh.scan, skill, r);
      } catch (error) {
        result = { ok: false, error: message(error) };
      }
      outcome = { skill, result: isRecord(result) ? result : { ok: false, error: "No result" } };
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
  const { skill, result } = outcome;
  await scanNow(scan, on); // the change is done either way; a failed re-scan is the panel's to report
  channel.bump(on);
  if (!result.ok) channel.say("error", result.error || "Something went wrong");
  else if (result.warn) channel.say("warn", result.warn);
  else channel.say("done", op.done(skill, label));
  return result;
}
