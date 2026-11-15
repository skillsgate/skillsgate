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
  effectiveMachine,
  emptyText,
  filterSkills,
  footerText,
  machineKey,
  machineLabel,
  noticeShown,
  sections,
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

const SIZE = { header: 44, tabs: 40, status: 34, footer: 32, row: 46, field: 32, chip: 24, button: 26, mark: 16, icon: 14 };
const DIALOG = { width: 760, height: 560 };

// Text sizes follow the person's UI font size. Inside a mod, settings() reports
// it at zoom 1 (`herdr-app status` shows it zoomed), and Herdr zooms a mod's
// sizes itself, so it is used as it is.
function fonts() {
  const size = Number((settings() ?? {}).ui_font_size);
  const base = size > 0 ? size : 13;
  return { base, small: base - 1, tiny: base - 2 };
}

// ---- Window facts ----

function findNode(node, id) {
  if (node?.id === id) return node;
  for (const child of node?.children ?? []) {
    const found = findNode(child, id);
    if (found) return found;
  }
  return null;
}

// The panel's copy stays alive (and its timers keep running) while its node is
// hidden, so it asks the layout before doing anything.
const panelNode = () => findNode(layout(), PANEL);
const panelHidden = () => Boolean(panelNode()?.hidden);
const shownSpaceMachine = () => spaces().find((s) => s.active)?.machine ?? null;
const viewedMachine = () => effectiveMachine(shared(MACHINE_CHOICE), shownSpaceMachine());

// ---- Small shared pieces ----

function iconButton(id, name, onClick, t) {
  return div()
    .id(id)
    .size(SIZE.button)
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

function button(id, label, onClick, t, f, primary = false) {
  return h_flex()
    .id(id)
    .h(30)
    .px(14)
    .flex_none()
    .items_center()
    .rounded(8)
    .border_1()
    .border_color(primary ? t.solid : t.input)
    .bg(primary ? t.solid : t.raised)
    .text_size(f.small)
    .text_color(primary ? t.solid_foreground : t.foreground)
    .cursor_pointer()
    .hover((s) => s.opacity(0.88))
    .on_click(onClick)
    .child(label);
}

// ---- Toggle: the tab-bar button ----

class Toggle {
  init() {}

  render() {
    const t = theme();
    const f = fonts();
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
          .h(SIZE.button)
          .px(8)
          .gap(6)
          .flex_none()
          .items_center()
          .rounded(6)
          .cursor_pointer()
          .text_size(f.small)
          .bg(open ? t.selected : t.chrome)
          .text_color(open ? t.foreground : t.muted)
          .hover((s) => s.bg(t.hover).text_color(t.foreground))
          .on_click(() => run("layout.toggle", { id: PANEL }))
          .child(svg(MARK).size(SIZE.mark).flex_none())
          .child(div().child("SkillsGate")),
      );
  }
}

// ---- Panel ----

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
    this.query = "";
    this.tool = null; // the chip that filters the list, or null for All
    this.typing = false;
    // Per machine key: { scan, skills, error, at, loading, unavailable }.
    this.states = new Map();
    this.viewedKey = undefined; // the machine the last frame showed
    this.wasHidden = false;
    this.drawn = ""; // what the clock-driven parts said in the last frame
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
    cx.timer.every(SCAN_EVERY_MS, (cx) => {
      if (panelHidden()) return;
      this.scan(viewedMachine(), cx);
      cx.notify();
    });
    cx.timer.every(TICK_MS, (cx) => this.tick(cx));
  }

  state(on) {
    const key = machineKey(on);
    if (!this.states.has(key)) {
      this.states.set(key, { scan: null, skills: null, error: null, at: 0, loading: false, unavailable: false });
    }
    return this.states.get(key);
  }

  // Starts a scan of machine `on` unless one is already running. It may be
  // called from render: the work begins after the frame. The caller redraws.
  scan(on, cx) {
    const state = this.state(on);
    if (state.loading) return;
    state.loading = true;
    cx.spawn(async (cx) => {
      await cx.sleep(0);
      try {
        const r = await machine.scan(on);
        if (r.ok) Object.assign(state, { scan: r.scan, skills: r.skills, error: null, at: Date.now() });
        else state.error = r.error;
      } catch (error) {
        state.error = String(error?.message ?? error);
      } finally {
        state.loading = false;
        cx.notify();
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
      this.scan(on, cx);
    }
  }

  // Every second: redraw only when the panel shows and something drawn from
  // the clock alone ("checked 12s ago", a notice running out) has changed.
  tick(cx) {
    if (panelHidden()) {
      this.wasHidden = true;
      return;
    }
    if (this.wasHidden || this.clockText(viewedMachine()) !== this.drawn) cx.notify();
  }

  clockText(on) {
    const now = Date.now();
    return `${footerText(this.state(on), now)}|${noticeShown(channel.notice(), now)}`;
  }

  markUnavailable() {
    const list = machines();
    for (const [key, state] of this.states) {
      state.unavailable = list.some((m) => machineKey(m.name) === key && m.layout === "unavailable");
    }
  }

  select(tab, cx) {
    this.tab = tab;
    cx.notify();
  }

  render(cx) {
    const t = theme();
    const f = fonts();
    const on = viewedMachine();
    this.watch(on, cx);
    const state = this.state(on);
    this.markUnavailable();
    this.drawn = this.clockText(on);
    const status = this.statusLine(on, t, f);
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
      .text_size(f.base)
      .child(this.header(on, t, f))
      .child(this.tabBar(t, f))
      .when(Boolean(status), (el) => el.child(status))
      .child(this.body(on, state, t, f))
      .child(this.footer(on, state, t, f));
  }

  header(on, t, f) {
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
          .h(24)
          .min_w(0)
          .max_w(200)
          .pl(10)
          .pr(6)
          .gap(3)
          .items_center()
          .rounded_full()
          .border_1()
          .border_color(t.border)
          .bg(t.raised)
          .text_size(f.small)
          .text_color(t.muted)
          .cursor_pointer()
          .hover((s) => s.bg(t.hover).text_color(t.foreground))
          .on_click((_e, cx) => this.select("machines", cx))
          .child(div().min_w(0).truncate().child(machineLabel(on)))
          .child(svg(icon("chevron-right")).size(12).flex_none()),
      )
      .child(iconButton("sg-close", "close", () => run("layout.hide", { id: PANEL }), t));
  }

  tabBar(t, f) {
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
            .h(28)
            .px(10)
            .flex()
            .items_center()
            .rounded(7)
            .border_1()
            .border_color(active ? t.border : t.background)
            .bg(active ? t.raised : t.background)
            .text_size(f.small)
            .text_color(active ? t.foreground : t.muted)
            .cursor_pointer()
            .hover((s) => s.bg(t.hover).text_color(t.foreground))
            .on_click((_e, cx) => this.select(id, cx))
            .child(label);
        }),
      );
  }

  // Work running on the viewed machine, else a notice that hasn't run out.
  // Null when there is neither.
  statusLine(on, t, f) {
    const line = () => h_flex().h(SIZE.status).flex_none().px(14).gap(8).items_center().border_b(1).border_color(t.border).text_size(f.small);
    const busy = channel.textAt(on);
    if (busy) {
      return line()
        .text_color(t.muted)
        .child(svg(icon("refresh")).size(13).flex_none().text_color(t.working).spin(900))
        .child(div().flex_1().min_w(0).truncate().child(busy));
    }
    const notice = channel.notice();
    if (!noticeShown(notice, Date.now())) return null;
    const color = notice.kind === "done" ? t.done : notice.kind === "warn" ? t.blocked : t.ansi1;
    return line()
      .text_color(color)
      .child(
        notice.kind === "done"
          ? svg(icon("check")).size(13).flex_none()
          : div().size(7).flex_none().rounded_full().bg(color),
      )
      .child(div().flex_1().min_w(0).truncate().child(notice.text));
  }

  body(on, state, t, f) {
    if (this.tab === "discover") return this.placeholder("Coming soon: search the skills catalog.", t);
    if (this.tab === "machines") return this.placeholder("Coming soon: skills on every Herdr machine.", t);
    return this.installed(on, state, t, f);
  }

  placeholder(text, t) {
    return div().flex_1().min_h(0).px(14).py(14).text_color(t.dim).child(text);
  }

  footer(on, state, t, f) {
    const text = footerText(state, Date.now());
    return h_flex()
      .h(SIZE.footer)
      .flex_none()
      .pl(14)
      .pr(6)
      .gap(8)
      .items_center()
      .border_t(1)
      .border_color(t.border)
      .text_size(f.tiny)
      .text_color(t.dim)
      .child(div().flex_1().min_w(0).truncate().when(Boolean(text), (el) => el.child(text)))
      .child(
        h_flex()
          .id("sg-refresh")
          .h(24)
          .px(8)
          .gap(5)
          .flex_none()
          .items_center()
          .rounded(6)
          .cursor_pointer()
          .text_color(t.muted)
          .hover((s) => s.bg(t.hover).text_color(t.foreground))
          .on_click((_e, cx) => {
            this.scan(on, cx);
            cx.notify();
          })
          .child(svg(icon("refresh")).size(13).flex_none().when(state.loading, (el) => el.spin(900)))
          .child("Refresh"),
      );
  }

  // ---- Installed ----

  installed(on, state, t, f) {
    const tab = v_flex().flex_1().min_h(0);
    if (state.error) return tab.child(this.errorState(on, state, t, f));
    if (!state.skills) return tab.child(this.filterField(t, f)).child(this.skeleton(t));
    if (!state.skills.length) return tab.child(this.emptyState(on, t, f));
    const chips = toolChips(state.scan, state.skills);
    // A chip from another machine's list filters nothing here.
    const tool = chips.some((c) => c.name === this.tool) ? this.tool : null;
    const shown = filterSkills(state.skills, { query: this.query, tool });
    return tab
      .child(this.filterField(t, f))
      .child(this.chipRow(chips, state.skills.length, tool, t, f))
      .child(this.list(on, shown, t, f));
  }

  filterField(t, f) {
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
      .child(Input.new(this.input).flex_1().min_w(0).h_full().text_size(f.base).text_color(t.foreground));
  }

  chipRow(chips, total, tool, t, f) {
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
        .text_size(f.tiny)
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
  list(on, skills, t, f) {
    const items = [];
    for (const group of sections(skills)) {
      items.push(
        div()
          .flex_none()
          .px(8)
          .pt(10)
          .pb(4)
          .text_size(f.tiny)
          .font_semibold()
          .text_color(t.dim)
          .child(`${group.title} · ${group.rows.length}`),
      );
      for (const skill of group.rows) items.push(this.row(on, skill, t, f));
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

  row(on, skill, t, f) {
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
            el.child(div().truncate().text_size(f.small).text_color(t.muted).child(skill.description)),
          ),
      )
      .child(div().flex_none().max_w(120).truncate().text_size(f.tiny).text_color(t.dim).child(toolSummary(skill)));
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
            .child(bar(110 + ((i * 37) % 80), 10))
            .child(bar(230 - ((i * 29) % 90), 8)),
        ),
      );
  }

  emptyState(on, t, f) {
    return v_flex()
      .flex_1()
      .min_h(0)
      .items_center()
      .justify_center()
      .gap(14)
      .p(24)
      .child(div().text_color(t.muted).child(emptyText(on)))
      .child(button("sg-browse", "Browse skills", (_e, cx) => this.select("discover", cx), t, f, true));
  }

  errorState(on, state, t, f) {
    return v_flex()
      .flex_1()
      .min_h(0)
      .items_center()
      .justify_center()
      .gap(14)
      .p(24)
      .child(div().max_w(320).text_center().text_color(t.muted).child(state.error))
      .child(
        button("sg-retry", state.loading ? "Checking…" : "Retry", (_e, cx) => {
          this.scan(on, cx);
          cx.notify();
        }, t, f),
      );
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
