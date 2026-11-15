// The panel's Discover tab: a search of the public skills.sh catalog. A row
// opens the catalog dialog for the viewed machine; its "Installed" tag follows
// that machine's shared store (the results themselves do not depend on it).
//
// A search runs 300 ms after the last keystroke, and only while this tab shows
// in a shown panel; a result whose query is no longer the field's is dropped.
// The latest outcome stays on screen while a newer search runs.

import { div, svg } from "gpui-kit";
import { h_flex, v_flex, Input, InputState, Scrollbar } from "gpui-base";
import { openOverlay } from "herdr";
import { MOD, catalog, errorText } from "./host.js";
import { DIALOG, SIZE, button, icon, skeletonRows, spinner } from "./ui.js";
import { catalogRows, discoverView, searchKey } from "./view-model.js";

const DEBOUNCE_MS = 300;

export default class DiscoverTab {
  // `shown()` says whether this tab shows in a shown panel.
  constructor(shown) {
    this.shown = shown;
    this.query = ""; // the field's text
    this.last = null; // the latest outcome kept: { key, results } or { key, error }
    this.edits = 0; // which scheduled search is the latest
    this.waiting = false; // a scheduled search has not started yet
    this.running = new Set(); // the keys of searches in flight
    this.typing = false;
    this.input = InputState.new({ placeholder: "Search skills.sh" });
    this.input.on("change", (_e, cx) => {
      this.query = this.input.value();
      this.schedule(cx, DEBOUNCE_MS);
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

  // Searches for the field's text after `delay` ms, unless it changes again
  // first. `force` searches again when the last outcome is already for that
  // text (Retry). It may be called from render: the work begins after the frame.
  schedule(cx, delay, force = false) {
    const edit = ++this.edits;
    this.waiting = true;
    cx.spawn(async (cx) => {
      await cx.sleep(delay);
      if (edit !== this.edits) return; // a later keystroke owns the search
      this.waiting = false;
      const key = searchKey(this.query);
      if (!this.shown() || this.running.has(key) || (!force && this.last?.key === key)) {
        if (this.shown()) cx.notify(); // the field's spinner may stop
        return;
      }
      this.running.add(key);
      cx.notify();
      let outcome;
      try {
        outcome = { key, results: await catalog.search(key) };
      } catch (error) {
        outcome = { key, error: errorText(error) };
      }
      this.running.delete(key);
      if (key === searchKey(this.query)) this.last = outcome; // else dropped: the field moved on
      if (this.shown()) cx.notify();
    });
  }

  // Whether the field's text has a search on its way.
  searching(key) {
    return this.running.has(key) || (this.waiting && this.last?.key !== key);
  }

  render(on, state, t, ts, cx) {
    const key = searchKey(this.query);
    // The first time the tab shows, after the panel shows again, or after a
    // search that ran while it was hidden was dropped.
    if (this.shown() && !this.waiting && !this.running.has(key) && this.last?.key !== key) this.schedule(cx, 0);
    const view = discoverView(this.last, key);
    const busy = this.searching(key);
    const tab = v_flex().flex_1().min_h(0).child(this.searchField(busy, t, ts));
    if (view.body === "error") return tab.child(this.errorState(view.message, busy, t, ts));
    if (view.body === "searching") return tab.child(skeletonRows(t));
    const results = this.last.results;
    const items = [this.label(view.label, t, ts)];
    if (view.body === "empty") items.push(div().px(8).py(12).text_color(t.dim).child(view.message));
    else catalogRows(results, state.skills).forEach((hit, i) => items.push(this.row(on, hit, results[i], i, t, ts)));
    return tab.child(this.list(items, t));
  }

  searchField(busy, t, ts) {
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
      .child(Input.new(this.input).flex_1().min_w(0).h_full().text_size(ts.base).text_color(t.foreground))
      .when(busy, (el) => el.child(spinner(t)));
  }

  label(text, t, ts) {
    return div().flex_none().px(8).pt(10).pb(4).text_size(ts.tiny).font_semibold().text_color(t.dim).child(text);
  }

  // The only part of the tab that scrolls.
  list(items, t) {
    return div()
      .flex_1()
      .min_h(0)
      .relative()
      .border_t(1)
      .border_color(t.border)
      .child(v_flex().id("sg-hits").absolute().inset_0().overflow_y_scroll().px(6).pb(8).children(items))
      .child(Scrollbar.vertical("sg-hits").absolute().inset_0());
  }

  // `hit` is the row as catalogRows shows it, `result` the search result it
  // came from. A row that can't be installed is dimmed and opens nothing.
  row(on, hit, result, i, t, ts) {
    const el = h_flex()
      .id(`sg-hit-${i}`)
      .h(SIZE.row)
      .flex_none()
      .px(8)
      .gap(10)
      .items_center()
      .rounded(8)
      .child(
        v_flex()
          .flex_1()
          .min_w(0)
          .gap(1)
          .child(div().truncate().text_color(t.foreground).child(hit.name))
          .when(Boolean(hit.source), (el) => el.child(div().truncate().text_size(ts.small).text_color(t.muted).child(hit.source))),
      )
      .when(hit.installed, (el) => el.child(this.installedTag(t, ts)))
      .child(div().flex_none().text_size(ts.tiny).text_color(t.dim).child(hit.installs));
    if (!hit.installable) return el.opacity(0.5);
    return el
      .cursor_pointer()
      .hover((s) => s.bg(t.hover))
      .on_click(() => this.open(on, hit, result));
  }

  installedTag(t, ts) {
    return h_flex()
      .h(SIZE.tag)
      .px(7)
      .gap(4)
      .flex_none()
      .items_center()
      .rounded_full()
      .border_1()
      .border_color(t.border)
      .bg(t.raised)
      .text_size(ts.micro)
      .text_color(t.done)
      .child(svg(icon("check")).size(SIZE.tinyIcon).flex_none())
      .child("Installed");
  }

  open(on, hit, result) {
    openOverlay({
      mod: MOD,
      kind: "dialog",
      frame: "none",
      width: DIALOG.width,
      height: DIALOG.height,
      props: { role: "catalog", on, row: { source: result.source, skillId: result.skillId, name: hit.name, installs: result.installs } },
    });
  }

  errorState(text, busy, t, ts) {
    return v_flex()
      .flex_1()
      .min_h(0)
      .items_center()
      .justify_center()
      .gap(14)
      .p(24)
      .border_t(1)
      .border_color(t.border)
      .child(div().max_w(SIZE.messageMax).text_center().text_color(t.muted).child(text))
      .child(
        button(
          "sg-discover-retry",
          busy ? "Searching…" : "Retry",
          (_e, cx) => {
            this.schedule(cx, 0, true);
            cx.notify();
          },
          t,
          ts,
        ),
      );
  }
}
