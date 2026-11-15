// The body of the panel's request loop: one request a dialog posted, run on
// the machine it names. main.js only schedules it (the panel role, never a
// dialog), so node --test covers everything that changes the disk.
//
// For one request: refuse an unknown op or a malformed request without
// touching anything; refuse a busy machine with a warning; find the skill by
// `key` in that machine's latest scan; take the machine's lock with the status
// text; run the operation; release the lock (also when the operation throws);
// re-scan the machine; raise its revision so open dialogs read again; and say
// the outcome as a notice.
//
// deps:
//   channel  createChannel(...)
//   machine  createMachine(...)
//   scanOf(on, fresh) -> Promise<{ scan, skills } | { error }>: the machine's
//            latest good scan, scanning first when there is none; with
//            `fresh` true it scans now (after a change) and keeps the result.

import { cantCheckText, machineInSentence, machineLabel, toolLabel } from "./model.js";

const isRecord = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
const message = (error) => String(error?.message ?? error);

// " on vps", or nothing for this computer.
const where = (on) => (on == null ? "" : ` on ${on}`);

// What each op needs, does and says. `tool` ops name a tool in the request.
const OPS = {
  link: {
    tool: true,
    running: (name, tool, on) => `Adding ${name} to ${tool}${where(on)}…`,
    done: (name, tool) => `Added ${name} to ${tool}`,
    run: (machine, on, scan, skill, req) => machine.link(on, scan, skill, req.tool),
  },
  unlink: {
    tool: true,
    running: (name, tool, on) => `Removing ${name} from ${tool}${where(on)}…`,
    done: (name, tool) => `Removed ${name} from ${tool}`,
    run: (machine, on, _scan, skill, req) => machine.unlink(on, skill, req.tool),
  },
  remove: {
    tool: false,
    running: (name, _tool, on) => `Deleting ${name}${where(on)}…`,
    done: (name) => `Deleted ${name}`,
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

// Runs one request. Never rejects. Returns the operation's Result when it ran,
// else null (refused, busy, unreadable machine, or the skill is gone).
export async function runRequest(req, { channel, machine, scanOf }) {
  const r = readRequest(req);
  if (!r) return null;
  const { op, on, key, tool } = r;
  const busy = () => channel.say("warn", `${machineLabel(on)} is busy. Try again when it finishes.`);
  if (channel.busyAt(on)) {
    busy();
    return null;
  }

  let latest;
  try {
    latest = await scanOf(on, false);
  } catch (error) {
    latest = { error: message(error) };
  }
  if (!Array.isArray(latest?.skills)) {
    channel.say("error", cantCheckText(on, latest?.error || "no answer"));
    return null;
  }
  const skill = latest.skills.find((s) => s.key === key);
  if (!skill) {
    channel.say("error", `That skill is no longer on ${machineInSentence(on)}.`);
    channel.bump(on); // a dialog that still shows it reads again and closes
    return null;
  }

  const label = tool === undefined ? "" : toolLabel(tool);
  // The lock is the real guard: another request may have taken the machine
  // while the scan above ran.
  if (!channel.claim(on, op.running(skill.name, label, on))) {
    busy();
    return null;
  }
  let result;
  try {
    result = await op.run(machine, on, latest.scan, skill, r);
  } catch (error) {
    result = { ok: false, error: message(error) };
  } finally {
    channel.release(on);
  }
  if (!isRecord(result)) result = { ok: false, error: "No result" };

  try {
    await scanOf(on, true);
  } catch {
    // The change is done either way; the panel's next scan catches up.
  }
  channel.bump(on);
  if (!result.ok) channel.say("error", result.error || "Something went wrong");
  else if (result.warn) channel.say("warn", result.warn);
  else channel.say("done", op.done(skill.name, label));
  return result;
}
