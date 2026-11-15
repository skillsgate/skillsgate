// The panel's Installed tab: the filter field, the tool chips and the list of
// the viewed machine's skills; a row opens the skill dialog.

import { div, svg } from "gpui-kit";
import { v_flex, h_flex, InputState, Input, Scrollbar } from "gpui-base";
import { openOverlay } from "herdr";
import { MOD } from "./host.js";
import { DIALOG, SIZE, button, icon, skeletonRows } from "./ui.js";
import { toolLabel } from "./model.js";
import { activeTool, emptyText, filterSkills, installedBody, sections, toolChips, toolSummary } from "./view-model.js";

export default class InstalledTab {
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
    if (body === "skeleton") return tab.child(this.filterField(t, ts)).child(skeletonRows(t));
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
