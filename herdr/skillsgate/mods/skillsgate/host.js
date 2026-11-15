// Host adapters and the singletons the views share: the one place Herdr's
// machine functions are called, the channel and the machine built on them,
// the facts about the window the panel and the toggle read, and the ids of
// requests already taken. It imports no view.

import { exec as hostExec, layout, readTextFile, setShared, shared, spaces } from "herdr";
import { createChannel } from "./channel.js";
import { createMachine } from "./machine.js";
import { effectiveMachine, layoutNode } from "./model.js";

export const MOD = "skillsgate";
export const PANEL = "skillsgate-panel";
export const MACHINE_CHOICE = "skillsgate.machine.v1";

// ---- Host adapters: the one place Herdr's machine functions are called ----

// Runs `script` with sh on machine `on` (null: this computer). Never rejects:
// a program that can't start or a machine that can't be reached comes back
// as code -1 with the reason in stderr.
export const exec = (script, args, on, timeout) =>
  hostExec("sh", ["-c", script, "skillsgate", ...args], { on, timeout }).catch((error) => ({
    code: -1,
    stdout: "",
    stderr: String(error?.message ?? error),
  }));

// Resolves the text, null only when the file is absent, and rejects on any
// other failure: Herdr's readTextFile already behaves so, so nothing is caught.
export const readText = (path, on) => readTextFile(path, { on });

export const channel = createChannel({ get: shared, set: setShared });
export const machine = createMachine({ exec, readText });

export const errorText = (error) => String(error?.message ?? error);

// ---- Window facts ----

// The panel's copy stays alive (and its timers keep running) while its node is
// hidden, so it asks the layout before doing anything.
export const panelNode = () => layoutNode(layout(), PANEL);
export const panelHidden = () => Boolean(panelNode()?.hidden);
const shownSpaceMachine = () => spaces().find((s) => s.active)?.machine ?? null;
export const viewedMachine = () => effectiveMachine(shared(MACHINE_CHOICE), shownSpaceMachine());

// The ids of requests a copy of this build has taken. Copies of one build
// share module state, so a second panel copy (mod.open puts one anywhere)
// never runs a request the first one took.
export const takenRequests = new Set();
