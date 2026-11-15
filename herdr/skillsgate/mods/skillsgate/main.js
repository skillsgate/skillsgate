// SkillsGate for Herdr: a tab-bar button and a panel listing the AI-agent
// skills on this computer and on Herdr's other machines.
//
// One mod, one role per copy (props().role):
//   (none)  the panel, inside the layout node "skillsgate-panel"
//   toggle  the tab-bar button that shows and hides that node
//   skill   a skill's dialog, opened by the panel with props { role, on, key }
//
// Dialogs never change anything themselves (their tasks end when they close).
// A switch or the delete button posts a request through the channel
// (channel.js) and only the panel listens: it runs each request with
// runRequest (requests.js), which takes the machine's lock, scans it,
// operates, re-scans and raises the machine's revision. An open dialog reads
// its machine again when that revision changes.
//
// Files. Views (they draw with Herdr's UI kit and may import Herdr):
//   main.js           this file: picks the role's view
//   host.js           the host adapters (exec, readText), the channel and
//                     machine built on them, window facts, taken request ids
//   ui.js             SIZE, textSizes() and the widgets several views share
//   toggle.js         the tab-bar button
//   panel.js          the panel's frame, timers and request loop, and its
//                     per-machine data (MachineData)
//   installed-tab.js  the Installed tab
//   discover-tab.js   the Discover tab
//   machines-tab.js   the Machines tab
//   skill-dialog.js   the skill dialog
// host.js and ui.js import no view. Logic (no Herdr imports, so node --test
// covers it; Herdr's functions come in as arguments from host.js):
//   registry.js, scripts.js, model.js, machine.js, catalog.js, channel.js,
//   requests.js.

import { View } from "gpui-kit";
import { props } from "herdr";
import Toggle from "./toggle.js";
import Panel from "./panel.js";
import SkillDialog from "./skill-dialog.js";

export default class SkillsGate extends View {
  init(initial, cx) {
    const role = (props() ?? initial ?? {}).role;
    this.role = role === "toggle" ? new Toggle() : role === "skill" ? new SkillDialog() : new Panel();
    this.role.init(cx);
  }

  render(cx) {
    return this.role.render(cx);
  }
}
