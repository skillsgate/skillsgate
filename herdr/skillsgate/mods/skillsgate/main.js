// SkillsGate for Herdr: a tab-bar button and a panel listing the AI-agent
// skills on this computer and on Herdr's other machines.
//
// One mod, one role per copy (props().role):
//   (none)  the panel, inside the layout node "skillsgate-panel"
//   toggle  the tab-bar button that shows and hides that node
//   skill   a skill's dialog, opened by the panel
//
// This is the only file that talks to Herdr. The other modules take Herdr's
// functions as arguments (the host adapters below), so node --test covers them.
//
// Layout of this file: host adapters, sizes, window facts, shared pieces, the
// toggle role, the panel's per-machine data (MachineData), the panel itself
// (its frame: header, tabs, status line, footer), one view class per tab
// (InstalledTab, DiscoverTab, MachinesTab), the skill dialog, and the role
// dispatch.

import { View, div, svg } from "gpui-kit";
import { v_flex, h_flex, InputState, Input, Scrollbar } from "gpui-base";
import {
  closeOverlay,
  exec as hostExec,
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
  clockRegions,
  effectiveMachine,
  emptyText,
  filterSkills,
  installedBody,
  layoutNode,
  machineKey,
  machineLabel,
  machineUnavailable,
  regionsChanged,
  scanNotice,
  sections,
  statusOf,
  toolChips,
  toolLabel,
  toolSummary,
} from "./model.js";

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
};
const DIALOG = { width: 760, height: 560 };

// Text sizes follow the person's UI font size. Inside a mod, settings() reports
// it at zoom 1 (`herdr-app status` shows it zoomed), and Herdr zooms a mod's
// sizes itself, so it is used as it is.
function textSizes() {
  const size = Number((settings() ?? {}).ui_font_size);
  const base = size > 0 ? size : 13;
  return { base, small: base - 1, tiny: base - 2 };
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

function placeholder(text, t) {
  return div().flex_1().min_h(0).px(14).py(14).text_color(t.dim).child(text);
}

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
  }

  state(on) {
    const key = machineKey(on);
    if (!this.states.has(key)) {
      this.states.set(key, { scan: null, skills: null, error: null, at: 0, loading: false, unavailable: false });
    }
    return this.states.get(key);
  }

  // Starts a scan of machine `on` unless one is already running, and says
  // whether it started. It may be called from render: the work begins after
  // the frame. The result redraws by itself; a caller outside render redraws
  // when this returns true (the Refresh icon starts spinning).
  scan(on, cx) {
    const state = this.state(on);
    if (state.loading) return false;
    state.loading = true;
    cx.spawn(async (cx) => {
      await cx.sleep(0);
      try {
        const r = await machine.scan(on);
        if (r.ok) Object.assign(state, { scan: r.scan, skills: r.skills, error: null, at: Date.now() });
        else this.failed(on, state, r.error);
      } catch (error) {
        this.failed(on, state, String(error?.message ?? error));
      } finally {
        state.loading = false;
        cx.notify();
      }
    });
    return true;
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

// ---- Panel: the frame and the timers ----

const TABS = [
  ["installed", "Installed"],
  ["discover", "Discover"],
  ["machines", "Machines"],
];
const SCAN_EVERY_MS = 30000;
const TICK_MS = 1000;

class Panel {
  init(cx) {
    this.tab = "installed";
    this.data = new MachineData();
    this.viewedKey = undefined; // the machine the last frame showed
    this.wasHidden = false;
    this.drawn = null; // the clock-driven parts the last frame showed (clockRegions)
    const select = (tab, cx) => this.select(tab, cx);
    const rescan = (on, cx) => this.data.scan(on, cx);
    this.views = { installed: new InstalledTab(select, rescan), discover: new DiscoverTab(), machines: new MachinesTab() };
    cx.timer.every(SCAN_EVERY_MS, (cx) => {
      if (panelHidden()) return;
      if (this.data.scan(viewedMachine(), cx)) cx.notify();
    });
    cx.timer.every(TICK_MS, (cx) => this.tick(cx));
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

  // Every second: while the panel is hidden, only note that it is (so showing
  // it again rescans). While it shows, redraw only when a part that changes
  // with the clock alone ("checked 10s ago", a notice running out) would read
  // differently from the last frame.
  tick(cx) {
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
        TABS.map(([id, label]) => {
          const active = this.tab === id;
          return div()
            .id(`sg-tab-${id}`)
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
            .on_click((_e, cx) => this.select(id, cx))
            .child(label);
        }),
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

// ---- Skill dialog (its content arrives with the skill view) ----

class SkillDialog {
  init() {}

  render() {
    const t = theme();
    return v_flex()
      .id("sg-skill")
      .size_full()
      .rounded(12)
      .overflow_hidden()
      .border_1()
      .border_color(t.border)
      .bg(t.popover)
      .text_color(t.foreground)
      .child(
        h_flex()
          .h(SIZE.header)
          .flex_none()
          .px(10)
          .items_center()
          .justify_end()
          .child(iconButton("sg-skill-close", "close", () => closeOverlay(props().overlay), t)),
      );
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
