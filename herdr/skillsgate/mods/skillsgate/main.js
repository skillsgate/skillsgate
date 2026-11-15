// SkillsGate for Herdr: a tab-bar button and a panel listing the AI-agent
// skills on this computer and on Herdr's other machines.
//
// One mod, one role per copy (props().role):
//   (none)   the panel, inside the layout node "skillsgate-panel"
//   toggle   the tab-bar button that shows and hides that node
//   skill    a skill's dialog, opened by the panel with props { role, on, key }
//   catalog  a skills.sh skill's dialog, opened from Discover with props
//            { role, on, row: { source, skillId, name, installs } }
//
// Dialogs never change anything themselves (their tasks end when they close).
// A switch, the delete button or Install posts a request through the channel
// (channel.js) and only the panel listens: it runs each request with
// runRequest (requests.js), which takes the machine's lock, scans it,
// operates, re-scans and raises the machine's revision. An open dialog reads
// its machine again when that revision changes.
//
// Files. Views (they draw with Herdr's UI kit and may import Herdr):
//   main.js            this file: picks the role's view
//   host.js            the host adapters (exec, readText, fetch), the channel,
//                      machine and catalog built on them, window facts, taken
//                      request ids
//   ui.js              SIZE, textSizes() and the widgets several views share
//   toggle.js          the tab-bar button
//   panel.js           the panel's frame, timers and request loop, and its
//                      per-machine data (MachineData)
//   installed-tab.js   the Installed tab
//   discover-tab.js    the Discover tab (the catalog search)
//   machines-tab.js    the Machines tab
//   skill-dialog.js    the skill dialog
//   catalog-dialog.js  the catalog dialog (preview, tools, Install)
// host.js and ui.js import no view. Logic (no Herdr imports, so node --test
// covers it; Herdr's functions come in as arguments from host.js):
//   registry.js, scripts.js, model.js (the data: scans, skills, the lock,
//   names and labels), view-model.js (what each view shows), machine.js,
//   catalog.js, channel.js, requests.js.

import { View } from "gpui-kit";
import { props } from "herdr";
import Toggle from "./toggle.js";
import Panel from "./panel.js";
import SkillDialog from "./skill-dialog.js";
import CatalogDialog from "./catalog-dialog.js";

export default class SkillsGate extends View {
  init(initial, cx) {
    const role = (props() ?? initial ?? {}).role;
    this.role =
      role === "toggle"
        ? new Toggle()
        : role === "skill"
          ? new SkillDialog()
          : role === "catalog"
            ? new CatalogDialog()
            : new Panel();
    this.role.init(cx);
  }

  render(cx) {
    return this.role.render(cx);
  }
}
