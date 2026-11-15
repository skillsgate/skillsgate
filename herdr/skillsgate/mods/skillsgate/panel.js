// The panel role: its per-machine data (MachineData), its frame (header,
// tabs, status line, footer), its timers, and the request loop that runs what
// dialogs post (runRequest, requests.js). Each tab is its own view file.

import { div, svg } from "gpui-kit";
import { h_flex, v_flex } from "gpui-base";
import { machines, run, theme } from "herdr";
import { PANEL, channel, errorText, machine, panelHidden, takenRequests, viewedMachine } from "./host.js";
import { MARK, SIZE, icon, iconButton, statusLine, tabButton, textSizes } from "./ui.js";
import { machineKey, machineLabel } from "./model.js";
import { clockRegions, machineUnavailable, regionsChanged, scanNotice } from "./view-model.js";
import { runRequest } from "./requests.js";
import InstalledTab from "./installed-tab.js";
import DiscoverTab from "./discover-tab.js";
import MachinesTab from "./machines-tab.js";

// ---- Per-machine data: scans and their results ----

class MachineData {
  constructor() {
    // Per machine key: { scan, skills, error, at, loading, unavailable }.
    this.states = new Map();
    // Per machine key: { running, started, shown }: how many scans run, how
    // many have started, and which one's result is kept. A request re-scans
    // while a timer's scan may still run, so an older scan that ends later
    // must not overwrite a newer one.
    this.runs = new Map();
  }

  state(on) {
    const key = machineKey(on);
    if (!this.states.has(key)) {
      this.states.set(key, { scan: null, skills: null, error: null, at: 0, loading: false, unavailable: false });
    }
    return this.states.get(key);
  }

  run(on) {
    const key = machineKey(on);
    if (!this.runs.has(key)) this.runs.set(key, { running: 0, started: 0, shown: 0 });
    return this.runs.get(key);
  }

  // Starts a scan of machine `on` unless one is already running, and says
  // whether it started. It may be called from render: the work begins after
  // the frame. The result redraws by itself, unless `unchanged()` says after
  // it that nothing on screen reads differently; a caller outside render
  // redraws when this returns true (the Refresh icon starts spinning).
  scan(on, cx, unchanged = null) {
    const state = this.state(on);
    if (state.loading) return false;
    state.loading = true;
    this.run(on).running++;
    cx.spawn(async (cx) => {
      await cx.sleep(0);
      await this.load(on, true);
      if (!unchanged?.()) cx.notify();
    });
    return true;
  }

  // Scans machine `on` now, keeps the result unless a scan that started later
  // has already been kept, and resolves with the scan's Result. Never rejects.
  // `counted`: scan() has already counted it as running. The request loop
  // scans through this (requests.js `scan`), so its fresh scans update the rows.
  async load(on, counted = false) {
    const state = this.state(on);
    const run = this.run(on);
    if (!counted) run.running++;
    state.loading = true;
    const seq = ++run.started;
    let r;
    try {
      try {
        r = await machine.scan(on);
      } catch (error) {
        r = { ok: false, error: errorText(error) };
      }
      if (seq > run.shown) {
        run.shown = seq;
        if (r.ok) Object.assign(state, { scan: r.scan, skills: r.skills, error: null, at: Date.now() });
        else this.failed(on, state, r.error);
      }
    } finally {
      run.running--;
      state.loading = run.running > 0;
    }
    return r;
  }

  // For the request loop (requests.js `known`): the machine's latest good
  // scan, or null. It only names the skill in the lock's status text.
  known(on) {
    const state = this.states.get(machineKey(on));
    return state?.skills ? { scan: state.scan, skills: state.skills } : null;
  }

  // A failed scan keeps the last good result. When there was one, the failure
  // is said once as a notice (again only if the error changes).
  failed(on, state, error) {
    const notice = scanNotice(on, state, error);
    state.error = error;
    if (notice) channel.say("error", notice);
  }

  markUnavailable() {
    const list = machines();
    for (const [key, state] of this.states) state.unavailable = machineUnavailable(list, key);
  }
}

// ---- Panel: the frame, the timers and the request loop ----

const TABS = [
  ["installed", "Installed"],
  ["discover", "Discover"],
  ["machines", "Machines"],
];
const SCAN_EVERY_MS = 30000;
const TICK_MS = 1000;

export default class Panel {
  init(cx) {
    this.tab = "installed";
    this.data = new MachineData();
    this.viewedKey = undefined; // the machine the last frame showed
    this.wasHidden = false;
    this.drawn = null; // the clock-driven parts the last frame showed (clockRegions)
    // Only the panel listens: a request posted before this copy started is
    // never run (channel.listen).
    this.next = channel.listen();
    const select = (tab, cx) => this.select(tab, cx);
    const rescan = (on, cx) => this.data.scan(on, cx);
    const discoverShown = () => this.tab === "discover" && !panelHidden();
    this.views = {
      installed: new InstalledTab(select, rescan),
      discover: new DiscoverTab(discoverShown),
      machines: new MachinesTab(this.data, select),
    };
    cx.timer.every(SCAN_EVERY_MS, (cx) => {
      if (panelHidden()) return;
      if (this.data.scan(viewedMachine(), cx)) cx.notify();
    });
    cx.timer.every(TICK_MS, (cx) => this.tick(cx));
  }

  // Runs the request a dialog posted, if there is a new one. Called at the top
  // of every frame (a post re-renders every mod) and by the 1 s tick, which
  // keeps running while the panel is hidden, so a request is never left
  // waiting for the panel to show. The work starts after the frame; once
  // started it runs to the end even if the panel hides or the dialog closes.
  pump(cx) {
    const req = this.next();
    if (!req || takenRequests.has(req.id)) return;
    takenRequests.add(req.id);
    cx.spawn(async (cx) => {
      await cx.sleep(0);
      try {
        await runRequest(req, {
          channel,
          machine,
          known: (on) => this.data.known(on),
          scan: (on) => this.data.load(on),
        });
      } finally {
        if (!panelHidden()) cx.notify();
      }
    });
  }

  // At the top of every frame: a change of the viewed machine, or the panel
  // showing again, starts a scan. Nothing starts while the panel is hidden.
  watch(on, cx) {
    if (panelHidden()) {
      this.wasHidden = true;
      return;
    }
    const key = machineKey(on);
    if (key !== this.viewedKey || this.wasHidden) {
      this.viewedKey = key;
      this.wasHidden = false;
      this.data.scan(on, cx);
    }
  }

  // Whether the Machines tab shows in a shown panel: only then does it scan
  // every machine (MachinesTab.keepFresh).
  machinesShown() {
    return this.tab === "machines" && !panelHidden();
  }

  // Every second: pick up a request (also while hidden: see pump), and let the
  // Machines tab start its due scans (it stops while hidden or on another
  // tab). While the panel is hidden, only note that it is (so showing it again
  // rescans). While it shows, redraw only when a scan started that the footer
  // shows, or a part that changes with the clock alone ("checked 10s ago", a
  // notice running out) would read differently from the last frame.
  tick(cx) {
    this.pump(cx);
    const on = viewedMachine();
    const started = this.views.machines.keepFresh(this.machinesShown(), on, cx);
    if (panelHidden()) {
      this.wasHidden = true;
      return;
    }
    const next = clockRegions(this.data.state(on), channel.textAt(on), channel.notice(), Date.now());
    if (started || this.wasHidden || regionsChanged(this.drawn, next)) cx.notify();
  }

  select(tab, cx) {
    this.tab = tab;
    cx.notify();
  }

  // The footer's Refresh: the viewed machine, or every machine on Machines.
  refresh(on, cx) {
    const started = this.tab === "machines" ? this.views.machines.scanAll(on, cx) : this.data.scan(on, cx);
    if (started) cx.notify();
  }

  render(cx) {
    const t = theme();
    const ts = textSizes();
    this.pump(cx);
    const on = viewedMachine();
    this.watch(on, cx);
    // Before markUnavailable, so every card's machine has its state.
    this.views.machines.keepFresh(this.machinesShown(), on, cx);
    const state = this.data.state(on);
    this.data.markUnavailable();
    // One clock reading per frame, so what is drawn is exactly what is recorded.
    this.drawn = clockRegions(state, channel.textAt(on), channel.notice(), Date.now());
    const { footer, status } = this.drawn;
    return v_flex()
      .id("sg-panel")
      .size_full()
      .min_h(0)
      .rounded(10)
      .overflow_hidden()
      .bg(t.background)
      .border_1()
      .border_color(t.border)
      .text_color(t.foreground)
      .text_size(ts.base)
      .child(this.header(on, t, ts))
      .child(this.tabBar(t, ts))
      .when(Boolean(status), (el) => el.child(statusLine(status, t, ts)))
      .child(this.views[this.tab].render(on, state, t, ts, cx))
      .child(this.footer(on, footer, state.loading, t, ts));
  }

  header(on, t, ts) {
    return h_flex()
      .h(SIZE.header)
      .flex_none()
      .pl(14)
      .pr(9)
      .gap(8)
      .items_center()
      .border_b(1)
      .border_color(t.border)
      .child(svg(MARK).size(SIZE.mark).flex_none().text_color(t.foreground))
      .child(div().flex_none().font_semibold().child("SkillsGate"))
      .child(div().flex_1())
      .child(
        h_flex()
          .id("sg-machine")
          .h(SIZE.pill)
          .min_w(0)
          .max_w(SIZE.pillMax)
          .pl(10)
          .pr(6)
          .gap(3)
          .items_center()
          .rounded_full()
          .border_1()
          .border_color(t.border)
          .bg(t.raised)
          .text_size(ts.small)
          .text_color(t.muted)
          .cursor_pointer()
          .hover((s) => s.bg(t.hover).text_color(t.foreground))
          .on_click((_e, cx) => this.select("machines", cx))
          .child(div().min_w(0).truncate().child(machineLabel(on)))
          .child(svg(icon("chevron-right")).size(SIZE.tinyIcon).flex_none()),
      )
      .child(iconButton("sg-close", "close", () => run("layout.hide", { id: PANEL }), t));
  }

  tabBar(t, ts) {
    return h_flex()
      .h(SIZE.tabs)
      .flex_none()
      .px(8)
      .gap(2)
      .items_center()
      .border_b(1)
      .border_color(t.border)
      .children(
        TABS.map(([id, label]) => tabButton(`sg-tab-${id}`, label, this.tab === id, (_e, cx) => this.select(id, cx), t, ts)),
      );
  }

  footer(on, text, loading, t, ts) {
    return h_flex()
      .h(SIZE.footer)
      .flex_none()
      .pl(14)
      .pr(6)
      .gap(8)
      .items_center()
      .border_t(1)
      .border_color(t.border)
      .text_size(ts.tiny)
      .text_color(t.dim)
      .child(div().flex_1().min_w(0).truncate().when(Boolean(text), (el) => el.child(text)))
      .child(
        h_flex()
          .id("sg-refresh")
          .h(SIZE.footerButton)
          .px(8)
          .gap(5)
          .flex_none()
          .items_center()
          .rounded(6)
          .cursor_pointer()
          .text_color(t.muted)
          .hover((s) => s.bg(t.hover).text_color(t.foreground))
          .on_click((_e, cx) => this.refresh(on, cx))
          .child(svg(icon("refresh")).size(SIZE.smallIcon).flex_none().when(loading, (el) => el.spin(900)))
          .child("Refresh"),
      );
  }
}
