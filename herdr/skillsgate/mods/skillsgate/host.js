// Host adapters and the singletons the views share: the one place Herdr's
// machine functions and `fetch` are called, the channel, machine and catalog
// built on them, the facts about the window the panel and the toggle read,
// and the ids of requests already taken. It imports no view.

import { exec as hostExec, layout, readTextFile, setShared, shared, spaces } from "herdr";
import { createCatalog } from "./catalog.js";
import { createChannel } from "./channel.js";
import { adaptExec, adaptReadText, createMachine } from "./machine.js";
import { withoutHerdrPrefix } from "./model.js";
import { effectiveMachine, layoutNode } from "./view-model.js";

export const MOD = "skillsgate";
export const PANEL = "skillsgate-panel";
export const MACHINE_CHOICE = "skillsgate.machine.v1";
export const TARGETS = "skillsgate.targets.v1"; // { [machineKey]: tool names }: the last install's tools

// ---- Host adapters: the one place Herdr's machine functions are called ----

// Runs `script` with sh on machine `on` (null: this computer). Never rejects:
// a program that can't start or a machine that can't be reached comes back
// as code -1 with the reason in stderr, without Herdr's "`herdr.exec`: ".
export const exec = adaptExec(hostExec);

// Resolves the text, null only when the file is absent, and rejects on any
// other failure (Herdr's readTextFile already behaves so), with Herdr's
// "`herdr.readTextFile`: " dropped from the reason.
export const readText = adaptReadText(readTextFile);

export const channel = createChannel({ get: shared, set: setShared });
export const machine = createMachine({ exec, readText });
// Herdr's global fetch: its response has the `ok`, `status`, `json()` and
// `text()` catalog.js reads.
export const catalog = createCatalog({ fetch: (url, options) => fetch(url, options) });

export const errorText = (error) => withoutHerdrPrefix(error?.message ?? error);

// ---- Window facts ----

// The panel's copy stays alive (and its timers keep running) while its node is
// hidden, so it asks the layout before doing anything.
export const panelNode = () => layoutNode(layout(), PANEL);
export const panelHidden = () => Boolean(panelNode()?.hidden);
const shownSpaceMachine = () => spaces().find((s) => s.active)?.machine ?? null;
// The stored choice of machine ({ follow, on }; absent means following). Only
// a click writes it: a card or the follow switch on the Machines tab.
export const machineChoice = () => shared(MACHINE_CHOICE);
export const setMachineChoice = (choice) => setShared(MACHINE_CHOICE, choice);
export const viewedMachine = () => effectiveMachine(machineChoice(), shownSpaceMachine());

// The ids of requests a copy of this build has taken. Copies of one build
// share module state, so a second panel copy (mod.open puts one anywhere)
// never runs a request the first one took.
export const takenRequests = new Set();
