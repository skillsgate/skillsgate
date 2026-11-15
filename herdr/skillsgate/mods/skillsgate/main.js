// SkillsGate for Herdr: a tab-bar button and a panel listing the AI-agent
// skills on this computer and on Herdr's other machines.
//
// One mod, one role per copy (props().role):
//   (none)  the panel, inside the layout node "skillsgate-panel"
//   toggle  the tab-bar button that shows and hides that node
//   skill   a skill's dialog, opened by the panel with props { role, on, key }
//
// This is the only file that talks to Herdr. The other modules take Herdr's
// functions as arguments (the host adapters below), so node --test covers them.
//
// Dialogs never change anything themselves (their tasks end when they close).
// A switch or the delete button posts a request through the channel
// (channel.js) and only the panel listens: it runs each request with
// runRequest (requests.js), which takes the machine's lock, scans it,
// operates, re-scans and raises the machine's revision. An open dialog reads
// its machine again when that revision changes.
//
// Layout of this file: host adapters, sizes, window facts, shared pieces, the
// toggle role, the panel's per-machine data (MachineData), the panel itself
// (its frame: header, tabs, status line, footer; its timers; its request
// loop), one view class per tab (InstalledTab, DiscoverTab, MachinesTab), the
// skill dialog (SkillDialog: header, Document and Tools tabs, a footer with
// delete), and the role dispatch.

import { View, div, image, svg } from "gpui-kit";
import { v_flex, h_flex, InputState, Input, Scrollbar, Switch, TextView } from "gpui-base";
import {
  closeOverlay,
  exec as hostExec,
  knownAgents,
  layout,
  machines,
  openOverlay,
  props,
  readTextFile,
  run,
  settings,
  setShared,
  shared,
  spaces,
  theme,
} from "herdr";
import { createChannel } from "./channel.js";
import { createMachine } from "./machine.js";
import {
  activeTool,
  cantCheckText,
  clockRegions,
  deleteLabel,
  effectiveMachine,
  emptyText,
  filterSkills,
  installedBody,
  layoutNode,
  machineKey,
  machineLabel,
  machineUnavailable,
  regionsChanged,
  requestPending,
  scanNotice,
  sections,
  shortPath,
  skillDocument,
  statusOf,
  toolChips,
  toolLabel,
  toolMark,
  toolRows,
  toolsNote,
  toolSummary,
} from "./model.js";
import { runRequest } from "./requests.js";

const MOD = "skillsgate";
const PANEL = "skillsgate-panel";
const MACHINE_CHOICE = "skillsgate.machine.v1";
const MARK = `mods/${MOD}/mark.svg`;
const icon = (name) => `mods/${MOD}/icons/${name}.svg`;

// ---- Host adapters: the one place Herdr's machine functions are called ----

// Runs `script` with sh on machine `on` (null: this computer). Never rejects:
// a program that can't start or a machine that can't be reached comes back
// as code -1 with the reason in stderr.
const exec = (script, args, on, timeout) =>
  hostExec("sh", ["-c", script, "skillsgate", ...args], { on, timeout }).catch((error) => ({
    code: -1,
    stdout: "",
    stderr: String(error?.message ?? error),
  }));

// Resolves the text, null only when the file is absent, and rejects on any
// other failure: Herdr's readTextFile already behaves so, so nothing is caught.
const readText = (path, on) => readTextFile(path, { on });

const channel = createChannel({ get: shared, set: setShared });
const machine = createMachine({ exec, readText });

// ---- Sizes, in px at zoom 1 (Herdr applies the person's zoom) ----
// The button's 118px width and the panel's 400px (380 to 720) are set on the
// layout nodes "skillsgate-toggle" and "skillsgate-panel".

const SIZE = {
  // regions, top to bottom
  header: 44,
  tabs: 40,
  status: 34,
  footer: 32,
  row: 46,
  // controls
  control: 26, // the toggle button and icon buttons
  button: 30, // text buttons (Browse skills, Retry)
  tab: 28,
  pill: 24,
  footerButton: 24,
  field: 32,
  chip: 24,
  // icons and marks
  mark: 16,
  icon: 14,
  smallIcon: 13,
  tinyIcon: 12,
  dot: 7,
  // widths
  pillMax: 200,
  rowToolsMax: 120,
  messageMax: 320,
  // skeleton bars
  skeletonName: 10,
  skeletonText: 8,
  // the skill dialog
  dialogHeader: 64,
  dialogFooter: 56,
  toolRow: 44,
  markBox: 24, // a tool's mark or two-letter badge
  toolMark: 16,
  switchWidth: 36,
  switchHeight: 20,
  knob: 16,
};
const DIALOG = { width: 760, height: 560 };

// Text sizes follow the person's UI font size. Inside a mod, settings() reports
// it at zoom 1 (`herdr-app status` shows it zoomed), and Herdr zooms a mod's
// sizes itself, so it is used as it is.
function textSizes() {
  const size = Number((settings() ?? {}).ui_font_size);
  const base = size > 0 ? size : 13;
  return { title: base + 2, base, small: base - 1, tiny: base - 2, micro: base - 3 };
}

// ---- Window facts ----

// The panel's copy stays alive (and its timers keep running) while its node is
// hidden, so it asks the layout before doing anything.
const panelNode = () => layoutNode(layout(), PANEL);
const panelHidden = () => Boolean(panelNode()?.hidden);
const shownSpaceMachine = () => spaces().find((s) => s.active)?.machine ?? null;
const viewedMachine = () => effectiveMachine(shared(MACHINE_CHOICE), shownSpaceMachine());

// ---- Small shared pieces ----

function iconButton(id, name, onClick, t) {
  return div()
    .id(id)
    .size(SIZE.control)
    .flex_none()
    .flex()
    .items_center()
    .justify_center()
    .rounded(6)
    .cursor_pointer()
    .text_color(t.muted)
    .hover((s) => s.bg(t.hover).text_color(t.foreground))
    .on_click(onClick)
    .child(svg(icon(name)).size(SIZE.icon));
}

function button(id, label, onClick, t, ts, primary = false) {
  return h_flex()
    .id(id)
    .h(SIZE.button)
    .px(14)
    .flex_none()
    .items_center()
    .rounded(8)
    .border_1()
    .border_color(primary ? t.solid : t.input)
    .bg(primary ? t.solid : t.raised)
    .text_size(ts.small)
    .text_color(primary ? t.solid_foreground : t.foreground)
    .cursor_pointer()
    .hover((s) => s.opacity(0.88))
    .on_click(onClick)
    .child(label);
}

// One tab of a tab bar (the panel's and the skill dialog's).
function tabButton(id, label, active, onClick, t, ts) {
  return div()
    .id(id)
    .h(SIZE.tab)
    .px(10)
    .flex()
    .items_center()
    .rounded(7)
    .border_1()
    .border_color(active ? t.border : t.background)
    .bg(active ? t.raised : t.background)
    .text_size(ts.small)
    .text_color(active ? t.foreground : t.muted)
    .cursor_pointer()
    .hover((s) => s.bg(t.hover).text_color(t.foreground))
    .on_click(onClick)
    .child(label);
}

function placeholder(text, t) {
  return div().flex_1().min_h(0).px(14).py(14).text_color(t.dim).child(text);
}

const errorText = (error) => String(error?.message ?? error);

// ---- Toggle: the tab-bar button ----

class Toggle {
  init() {}

  render() {
    const t = theme();
    const ts = textSizes();
    const node = panelNode();
    const open = Boolean(node) && !node.hidden;
    return h_flex()
      .size_full()
      .pr(10)
      .items_center()
      .justify_end()
      .bg(t.chrome)
      .border_b(1)
      .border_color(t.border)
      .child(
        h_flex()
          .id("sg-toggle")
          .h(SIZE.control)
          .px(8)
          .gap(6)
          .flex_none()
          .items_center()
          .rounded(6)
          .cursor_pointer()
          .text_size(ts.small)
          .bg(open ? t.selected : t.chrome)
          .text_color(open ? t.foreground : t.muted)
          .hover((s) => s.bg(t.hover).text_color(t.foreground))
          .on_click(() => run("layout.toggle", { id: PANEL }))
          .child(svg(MARK).size(SIZE.mark).flex_none())
          .child(div().child("SkillsGate")),
      );
  }
}

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
  // the frame. The result redraws by itself; a caller outside render redraws
  // when this returns true (the Refresh icon starts spinning).
  scan(on, cx) {
    const state = this.state(on);
    if (state.loading) return false;
    state.loading = true;
    this.run(on).running++;
    cx.spawn(async (cx) => {
      await cx.sleep(0);
      await this.load(on, true);
      cx.notify();
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

// The ids of requests a copy of this build has taken. Copies of one build
// share module state, so a second panel copy (mod.open puts one anywhere)
// never runs a request the first one took.
const takenRequests = new Set();

class Panel {
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
    this.views = { installed: new InstalledTab(select, rescan), discover: new DiscoverTab(), machines: new MachinesTab() };
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

  // Every second: pick up a request (also while hidden: see pump). While the
  // panel is hidden, only note that it is (so showing it again rescans).
  // While it shows, redraw only when a part that changes with the clock alone
  // ("checked 10s ago", a notice running out) would read differently from the
  // last frame.
  tick(cx) {
    this.pump(cx);
    if (panelHidden()) {
      this.wasHidden = true;
      return;
    }
    const on = viewedMachine();
    const next = clockRegions(this.data.state(on), channel.textAt(on), channel.notice(), Date.now());
    if (this.wasHidden || regionsChanged(this.drawn, next)) cx.notify();
  }

  select(tab, cx) {
    this.tab = tab;
    cx.notify();
  }

  refresh(on, cx) {
    if (this.data.scan(on, cx)) cx.notify();
  }

  render(cx) {
    const t = theme();
    const ts = textSizes();
    this.pump(cx);
    const on = viewedMachine();
    this.watch(on, cx);
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
      .when(Boolean(status), (el) => el.child(this.statusLine(status, t, ts)))
      .child(this.views[this.tab].render(on, state, t, ts))
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

  // `status` is statusOf(...): work running on the viewed machine, or a notice.
  statusLine(status, t, ts) {
    const line = h_flex().h(SIZE.status).flex_none().px(14).gap(8).items_center().border_b(1).border_color(t.border).text_size(ts.small);
    const text = div().flex_1().min_w(0).truncate().child(status.text);
    if (status.kind === "busy") {
      return line
        .text_color(t.muted)
        .child(svg(icon("refresh")).size(SIZE.smallIcon).flex_none().text_color(t.working).spin(900))
        .child(text);
    }
    const color = status.kind === "done" ? t.done : status.kind === "warn" ? t.blocked : t.ansi1;
    return line
      .text_color(color)
      .child(
        status.kind === "done"
          ? svg(icon("check")).size(SIZE.smallIcon).flex_none()
          : div().size(SIZE.dot).flex_none().rounded_full().bg(color),
      )
      .child(text);
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

// ---- Installed tab ----

class InstalledTab {
  // `select(tab, cx)` switches the panel's tab; `rescan(on, cx)` starts a scan
  // and says whether it started.
  constructor(select, rescan) {
    this.select = select;
    this.rescan = rescan;
    this.query = "";
    this.tool = null; // the chip that filters the list, or null for All
    this.typing = false;
    this.input = InputState.new({ placeholder: "Filter skills" });
    this.input.on("change", (_e, cx) => {
      this.query = this.input.value();
      cx.notify();
    });
    this.input.on("focus", (_e, cx) => {
      this.typing = true;
      cx.notify();
    });
    this.input.on("blur", (_e, cx) => {
      this.typing = false;
      cx.notify();
    });
  }

  render(on, state, t, ts) {
    const tab = v_flex().flex_1().min_h(0);
    const body = installedBody(state);
    if (body === "error") return tab.child(this.errorState(on, state, t, ts));
    if (body === "skeleton") return tab.child(this.filterField(t, ts)).child(this.skeleton(t));
    if (body === "empty") return tab.child(this.emptyState(on, t, ts));
    const chips = toolChips(state.scan, state.skills);
    const tool = activeTool(chips, this.tool);
    const shown = filterSkills(state.skills, { query: this.query, tool });
    return tab
      .child(this.filterField(t, ts))
      .child(this.chipRow(chips, state.skills.length, tool, t, ts))
      .child(this.list(on, shown, t, ts));
  }

  filterField(t, ts) {
    return h_flex()
      .flex_none()
      .mx(10)
      .mt(10)
      .mb(8)
      .h(SIZE.field)
      .px(10)
      .gap(8)
      .items_center()
      .rounded(8)
      .border_1()
      .border_color(this.typing ? t.accent : t.input)
      .bg(t.background)
      .child(svg(icon("search")).size(SIZE.icon).flex_none().text_color(t.dim))
      .child(Input.new(this.input).flex_1().min_w(0).h_full().text_size(ts.base).text_color(t.foreground));
  }

  chipRow(chips, total, tool, t, ts) {
    const chip = (id, label, count, selected, onClick) =>
      h_flex()
        .id(id)
        .h(SIZE.chip)
        .px(9)
        .gap(5)
        .flex_none()
        .items_center()
        .rounded_full()
        .border_1()
        .border_color(selected ? t.accent : t.border)
        .bg(selected ? t.selected : t.background)
        .text_size(ts.tiny)
        .text_color(selected ? t.foreground : t.muted)
        .cursor_pointer()
        .hover((s) => s.bg(t.hover).text_color(t.foreground))
        .on_click(onClick)
        .child(label)
        .child(div().text_color(t.dim).child(String(count)));
    return h_flex()
      .flex_none()
      .flex_wrap()
      .px(10)
      .pb(6)
      .gap(6)
      .child(
        chip("sg-chip-all", "All", total, tool === null, (_e, cx) => {
          this.tool = null;
          cx.notify();
        }),
      )
      .children(
        chips.map((c) =>
          chip(`sg-chip-${c.name}`, toolLabel(c.name), c.count, tool === c.name, (_e, cx) => {
            this.tool = this.tool === c.name ? null : c.name;
            cx.notify();
          }),
        ),
      );
  }

  // The only part of the panel that scrolls.
  list(on, skills, t, ts) {
    const items = [];
    for (const group of sections(skills)) {
      items.push(
        div()
          .flex_none()
          .px(8)
          .pt(10)
          .pb(4)
          .text_size(ts.tiny)
          .font_semibold()
          .text_color(t.dim)
          .child(`${group.title} · ${group.rows.length}`),
      );
      for (const skill of group.rows) items.push(this.row(on, skill, t, ts));
    }
    if (!items.length) items.push(div().px(8).py(12).text_color(t.dim).child("No skills match"));
    return div()
      .flex_1()
      .min_h(0)
      .relative()
      .border_t(1)
      .border_color(t.border)
      .child(v_flex().id("sg-list").absolute().inset_0().overflow_y_scroll().px(6).pb(8).children(items))
      .child(Scrollbar.vertical("sg-list").absolute().inset_0());
  }

  row(on, skill, t, ts) {
    return h_flex()
      .id(`sg-row-${skill.key}`)
      .h(SIZE.row)
      .flex_none()
      .px(8)
      .gap(10)
      .items_center()
      .rounded(8)
      .cursor_pointer()
      .hover((s) => s.bg(t.hover))
      .on_click(() =>
        openOverlay({
          mod: MOD,
          kind: "dialog",
          frame: "none",
          width: DIALOG.width,
          height: DIALOG.height,
          props: { role: "skill", on, key: skill.key },
        }),
      )
      .child(
        v_flex()
          .flex_1()
          .min_w(0)
          .gap(1)
          .child(div().truncate().text_color(t.foreground).child(skill.name))
          .when(Boolean(skill.description), (el) =>
            el.child(div().truncate().text_size(ts.small).text_color(t.muted).child(skill.description)),
          ),
      )
      .child(
        div().flex_none().max_w(SIZE.rowToolsMax).truncate().text_size(ts.tiny).text_color(t.dim).child(toolSummary(skill)),
      );
  }

  // Placeholder rows while the first scan of a machine runs.
  skeleton(t) {
    const bar = (w, h) => div().w(w).h(h).rounded(4).bg(t.raised);
    return v_flex()
      .flex_1()
      .min_h(0)
      .px(14)
      .pt(8)
      .border_t(1)
      .border_color(t.border)
      .children(
        [0, 1, 2, 3, 4, 5].map((i) =>
          v_flex()
            .id(`sg-skeleton-${i}`)
            .h(SIZE.row)
            .flex_none()
            .justify_center()
            .gap(7)
            .loop("opacity", { from: 0.4, to: 1, period: 1200 })
            .child(bar(110 + ((i * 37) % 80), SIZE.skeletonName))
            .child(bar(230 - ((i * 29) % 90), SIZE.skeletonText)),
        ),
      );
  }

  emptyState(on, t, ts) {
    return v_flex()
      .flex_1()
      .min_h(0)
      .items_center()
      .justify_center()
      .gap(14)
      .p(24)
      .child(div().text_color(t.muted).child(emptyText(on)))
      .child(button("sg-browse", "Browse skills", (_e, cx) => this.select("discover", cx), t, ts, true));
  }

  // Only while the machine has never had a good scan (installedBody).
  errorState(on, state, t, ts) {
    return v_flex()
      .flex_1()
      .min_h(0)
      .items_center()
      .justify_center()
      .gap(14)
      .p(24)
      .child(div().max_w(SIZE.messageMax).text_center().text_color(t.muted).child(state.error))
      .child(
        button(
          "sg-retry",
          state.loading ? "Checking…" : "Retry",
          (_e, cx) => {
            if (this.rescan(on, cx)) cx.notify();
          },
          t,
          ts,
        ),
      );
  }
}

// ---- Discover tab (the catalog search arrives with the Discover task) ----

class DiscoverTab {
  render(_on, _state, t) {
    return placeholder("Coming soon: search the skills catalog.", t);
  }
}

// ---- Machines tab (machine cards arrive with the Machines task) ----

class MachinesTab {
  render(_on, _state, t) {
    return placeholder("Coming soon: skills on every Herdr machine.", t);
  }
}

// ---- Skill dialog: one skill's document and tools, and delete ----
//
// It reads for itself: a scan of its machine when it opens and again whenever
// the machine's revision changes (a request finished), and SKILL.md once. A
// skill that is gone after a scan closes the dialog. Its switches and its
// delete button post requests; they are disabled while the machine is busy or
// a request it sent has no outcome yet (requestPending).

const DIALOG_TABS = [
  ["document", "Document"],
  ["tools", "Tools"],
];
const ARM_MS = 4000; // how long the delete button stays armed

class SkillDialog {
  init(cx) {
    const p = props() ?? {};
    this.on = typeof p.on === "string" && p.on ? p.on : null; // null: this computer
    this.key = typeof p.key === "string" ? p.key : "";
    this.overlay = p.overlay;
    this.tab = "document";
    this.scan = null; // the latest good scan of the machine
    this.skill = null; // the skill in that scan
    this.error = null; // why the first scan failed
    this.doc = null; // skillDocument(...) once SKILL.md is read
    this.docStarted = false;
    this.programs = null; // knownAgents(), for the tool marks; [] if it failed
    this.rev = channel.rev(this.on); // the revision the latest read was asked at
    this.readRev = -1; // the revision the latest finished read began at
    this.reading = false;
    this.again = false; // a read was asked for while one ran
    this.sent = null; // the last request sent: { tool?, on?, rev, at }
    this.armed = false;
    this.arms = 0; // which arming the delete button's timer belongs to
    this.closed = false;
    this.handle = cx.focus_handle();
    this.handle.focus();
    this.read(cx);
    cx.spawn(async (cx) => {
      let list = null;
      try {
        list = await knownAgents(); // this computer: the icons are its files
      } catch {
        // the two-letter badges stay
      }
      this.programs = Array.isArray(list) ? list : [];
      if (!this.closed) cx.notify();
    });
  }

  close() {
    if (this.closed) return;
    this.closed = true;
    closeOverlay(this.overlay);
  }

  // Scans the machine and finds the skill again; asked for while a read runs,
  // it reads once more after it. It may be called from render: the work
  // begins after the frame.
  read(cx) {
    if (this.reading) {
      this.again = true;
      return;
    }
    this.reading = true;
    cx.spawn(async (cx) => {
      await cx.sleep(0);
      do {
        this.again = false;
        const rev = this.rev;
        let r;
        try {
          r = await machine.scan(this.on);
        } catch (error) {
          r = { ok: false, error: errorText(error) };
        }
        if (this.closed) return;
        if (r.ok) {
          const skill = r.skills.find((s) => s.key === this.key);
          if (!skill) return this.close();
          this.scan = r.scan;
          this.skill = skill;
          this.error = null;
        } else if (!this.skill) {
          this.error = r.error;
        }
        this.readRev = rev;
      } while (this.again);
      this.reading = false;
      cx.notify();
      if (this.skill && !this.docStarted) {
        this.docStarted = true;
        this.doc = await this.readDocument(this.skill);
        if (!this.closed) cx.notify();
      }
    });
  }

  async readDocument(skill) {
    try {
      return skillDocument({ text: await readText(skill.real + "/SKILL.md", this.on) });
    } catch (error) {
      return skillDocument({ error: errorText(error) });
    }
  }

  pending() {
    return requestPending(this.sent, {
      rev: channel.rev(this.on),
      readRev: this.readRev,
      notice: channel.notice(),
      busy: channel.busyAt(this.on),
      now: Date.now(),
    });
  }

  // Hands a request to the panel. `wanted` is how the switch should look
  // until the outcome is read.
  send(request, wanted = {}) {
    this.sent = { ...wanted, rev: channel.rev(this.on), at: Date.now() };
    channel.request(request);
  }

  toggle(tool, on) {
    if (channel.busyAt(this.on) || this.pending()) return;
    this.send({ op: on ? "link" : "unlink", on: this.on, key: this.key, tool }, { tool, on });
  }

  // The first click arms the button for ARM_MS; a second click in that time
  // asks the panel to delete the skill.
  deleteClicked(cx) {
    if (channel.busyAt(this.on) || this.pending()) return;
    const arm = ++this.arms;
    if (!this.armed) {
      this.armed = true;
      cx.timer.after(ARM_MS, (cx) => {
        if (this.closed || this.arms !== arm) return;
        this.armed = false;
        cx.notify();
      });
    } else {
      this.armed = false;
      this.send({ op: "remove", on: this.on, key: this.key });
    }
    cx.notify();
  }

  key(e, cx) {
    if (e.key !== "escape") return;
    this.close();
    cx.stop_propagation();
  }

  render(cx) {
    const t = theme();
    const ts = textSizes();
    const rev = channel.rev(this.on);
    if (rev !== this.rev) {
      this.rev = rev;
      this.read(cx);
    }
    const card = v_flex()
      .id("sg-skill")
      .track_focus(this.handle)
      .on_key_down((e, cx) => this.key(e, cx))
      .size_full()
      .min_h(0)
      .rounded(12)
      .overflow_hidden()
      .border_1()
      .border_color(t.border)
      .bg(t.popover)
      .text_color(t.foreground)
      .text_size(ts.base);
    const skill = this.skill;
    if (!skill) {
      const text = this.error ? cantCheckText(this.on, this.error) : "Loading…";
      return card
        .child(this.header(null, t, ts))
        .child(div().flex_1().min_h(0).flex().items_center().justify_center().p(24).text_color(t.muted).child(text))
        .child(this.footer(null, false, t, ts));
    }
    const waiting = this.pending();
    const locked = waiting || channel.busyAt(this.on);
    return card
      .child(this.header(skill, t, ts))
      .child(this.tabBar(skill, t, ts))
      .child(this.tab === "tools" ? this.toolsTab(skill, waiting ? this.sent : null, locked, t, ts) : this.documentTab(skill, t, ts))
      .child(this.footer(skill, locked, t, ts));
  }

  // The name, the folder as ~/..., and the machine.
  header(skill, t, ts) {
    const place = h_flex().min_w(0).gap(6).text_size(ts.small).text_color(t.muted);
    return h_flex()
      .h(SIZE.dialogHeader)
      .flex_none()
      .pl(20)
      .pr(12)
      .gap(12)
      .items_center()
      .border_b(1)
      .border_color(t.border)
      .child(
        v_flex()
          .flex_1()
          .min_w(0)
          .gap(3)
          .when(Boolean(skill), (el) => el.child(div().truncate().text_size(ts.title).font_semibold().child(skill.name)))
          .child(
            place
              .when(Boolean(skill), (el) =>
                el
                  .child(div().min_w(0).truncate().child(shortPath(skill.real, this.scan.home)))
                  .child(div().flex_none().text_color(t.dim).child("·")),
              )
              .child(div().flex_none().child(machineLabel(this.on))),
          ),
      )
      .child(iconButton("sg-skill-close", "close", () => this.close(), t));
  }

  tabBar(skill, t, ts) {
    const label = (id, text) => (id === "tools" ? `${text} ${skill.tools.length}` : text);
    return h_flex()
      .h(SIZE.tabs)
      .flex_none()
      .px(14)
      .gap(2)
      .items_center()
      .border_b(1)
      .border_color(t.border)
      .children(
        DIALOG_TABS.map(([id, text]) =>
          tabButton(`sg-skill-tab-${id}`, label(id, text), this.tab === id, (_e, cx) => {
            this.tab = id;
            cx.notify();
          }, t, ts),
        ),
      );
  }

  // The description, then SKILL.md rendered without its frontmatter.
  documentTab(skill, t, ts) {
    const doc = this.doc;
    const body = v_flex()
      .id("sg-skill-doc")
      .absolute()
      .inset_0()
      .overflow_y_scroll()
      .px(20)
      .py(16)
      .gap(14)
      .when(Boolean(skill.description), (el) => el.child(div().text_color(t.muted).child(skill.description)))
      .when(!doc, (el) => el.child(div().text_color(t.dim).child("Loading…")))
      .when(Boolean(doc?.message), (el) => el.child(div().text_size(ts.small).text_color(t.muted).child(doc.message)))
      .when(Boolean(doc?.body), (el) => el.child(TextView.markdown("sg-skill-md", doc.body).selectable(true)));
    return div().flex_1().min_h(0).relative().child(body).child(Scrollbar.vertical("sg-skill-doc").absolute().inset_0());
  }

  toolsTab(skill, wanted, locked, t, ts) {
    const note = toolsNote(this.scan, skill);
    const list = v_flex()
      .id("sg-skill-tools")
      .absolute()
      .inset_0()
      .overflow_y_scroll()
      .px(12)
      .py(10)
      .gap(2)
      .when(Boolean(note), (el) =>
        el.child(
          div().flex_none().mx(8).mb(8).p(12).rounded(8).border_1().border_color(t.border).bg(t.raised).text_size(ts.small).text_color(t.muted).child(note),
        ),
      )
      .children(toolRows(this.scan, skill, wanted).map((row) => this.toolRow(row, locked, t, ts)));
    return div().flex_1().min_h(0).relative().child(list).child(Scrollbar.vertical("sg-skill-tools").absolute().inset_0());
  }

  toolRow(row, locked, t, ts) {
    return h_flex()
      .id(`sg-skill-tool-${row.name}`)
      .h(SIZE.toolRow)
      .flex_none()
      .px(10)
      .gap(12)
      .items_center()
      .rounded(8)
      .child(this.mark(row, t, ts))
      .child(div().flex_1().min_w(0).truncate().child(row.label))
      .when(row.control === "switch", (el) => el.child(this.switchFor(row, locked, t)))
      .when(row.control === "shared", (el) => el.child(div().flex_none().text_size(ts.small).text_color(t.muted).child("Shared copy")))
      .when(row.control === "none" && row.on, (el) => el.child(svg(icon("check")).size(SIZE.icon).flex_none().text_color(t.muted)));
  }

  // Herdr's own mark for the tool's program, else its two-letter badge.
  mark(row, t, ts) {
    const box = div().size(SIZE.markBox).flex_none().flex().items_center().justify_center();
    const mark = toolMark(this.programs, row.program);
    if (mark) {
      return box.child(
        mark.tint ? svg(mark.icon).size(SIZE.toolMark).text_color(t.foreground) : image(mark.icon).w(SIZE.toolMark).h(SIZE.toolMark),
      );
    }
    return box
      .rounded(6)
      .border_1()
      .border_color(t.border)
      .bg(t.raised)
      .text_size(ts.micro)
      .font_semibold()
      .text_color(t.muted)
      .child(row.shortCode);
  }

  switchFor(row, locked, t) {
    return Switch.new(`sg-skill-switch-${row.name}`)
      .checked(row.on)
      .disabled(locked)
      .on_change((checked) => this.toggle(row.name, checked))
      .w(SIZE.switchWidth)
      .h(SIZE.switchHeight)
      .flex_none()
      .flex()
      .items_center()
      .p(2)
      .rounded_full()
      .bg(row.on ? t.accent : t.hover)
      .when(row.on, (el) => el.justify_end())
      .when(locked, (el) => el.opacity(0.5))
      .when(!locked, (el) => el.cursor_pointer())
      .child(div().size(SIZE.knob).rounded_full().bg(row.on ? t.accent_foreground : t.muted));
  }

  // Delete at the left, the machine's running work in the middle, Done at the right.
  footer(skill, locked, t, ts) {
    const busy = channel.textAt(this.on);
    return h_flex()
      .h(SIZE.dialogFooter)
      .flex_none()
      .px(16)
      .gap(12)
      .items_center()
      .border_t(1)
      .border_color(t.border)
      .when(Boolean(skill), (el) => el.child(this.deleteButton(skill, locked, t, ts)))
      .child(
        h_flex()
          .flex_1()
          .min_w(0)
          .gap(8)
          .items_center()
          .text_size(ts.small)
          .text_color(t.muted)
          .when(Boolean(busy), (el) =>
            el
              .child(svg(icon("refresh")).size(SIZE.smallIcon).flex_none().text_color(t.working).spin(900))
              .child(div().min_w(0).truncate().child(busy)),
          ),
      )
      .child(button("sg-skill-done", "Done", () => this.close(), t, ts, true));
  }

  deleteButton(skill, locked, t, ts) {
    const armed = this.armed && !locked;
    return h_flex()
      .id("sg-skill-delete")
      .h(SIZE.button)
      .px(12)
      .gap(6)
      .flex_none()
      .items_center()
      .rounded(8)
      .border_1()
      .border_color(armed ? t.ansi1 : t.input)
      .bg(armed ? t.ansi1 : t.raised)
      .text_size(ts.small)
      .text_color(armed ? t.background : t.ansi1)
      .when(locked, (el) => el.opacity(0.5))
      .when(!locked, (el) => el.cursor_pointer().hover((s) => s.opacity(0.88)).on_click((_e, cx) => this.deleteClicked(cx)))
      .child(svg(icon("trash")).size(SIZE.smallIcon).flex_none())
      .child(deleteLabel(skill, armed));
  }
}

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
