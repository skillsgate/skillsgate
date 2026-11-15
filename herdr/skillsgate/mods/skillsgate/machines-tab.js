// The panel's Machines tab: the "Follow the shown space" switch and one card
// per Herdr machine (status dot, name, "Viewing", counts, its top tools, and a
// line when something is wrong). A card views its machine and opens
// Installed; the switch goes back to following the shown space. Both write
// the choice from their click handlers only.
//
// While this tab shows in a shown panel it keeps every machine's scan fresh
// (keepFresh, which the panel calls every frame and every second): opening it
// scans every machine at once, each in its own task, so one that fails or
// hangs until its 30 s timeout never holds up or hides another; they are all
// scanned again every 60 s, and a machine that appears meanwhile at once.
// Nothing is scanned from here while the panel is hidden or another tab shows.

import { div } from "gpui-kit";
import { h_flex, v_flex, Scrollbar } from "gpui-base";
import { machines, spaces } from "herdr";
import { machineChoice, setMachineChoice, viewedMachine } from "./host.js";
import { SIZE, toggleSwitch } from "./ui.js";
import { machineKey } from "./model.js";
import { allScanDue, cardMachines, followChoice, following, machineCard, machineCards, viewChoice } from "./view-model.js";

const PULSE = { from: 0.4, to: 1, period: 1200 }; // a card whose first scan runs

export default class MachinesTab {
  // `data` is the panel's MachineData (every machine's state and scans);
  // `select(tab, cx)` switches the panel's tab.
  constructor(data, select) {
    this.data = data;
    this.select = select;
    this.scannedAt = null; // when this tab last scanned every machine; null while it is not shown
    this.drawn = new Map(); // each card as the last frame drew it (JSON), by machine key
  }

  // Starts the scans that are due, given whether this tab shows in a shown
  // panel, and says whether that changed what is on screen (the footer's
  // Refresh icon turns while the viewed machine is scanned; a card looks the
  // same until its result). It may be called from render: each scan's work
  // begins after the frame (MachineData.scan).
  keepFresh(shown, viewed, cx) {
    if (!shown) {
      this.scannedAt = null;
      return false;
    }
    if (allScanDue(this.scannedAt, Date.now())) return this.scanAll(viewed, cx);
    let changed = false;
    for (const on of this.names(viewed)) {
      // A machine with no result yet that is not being scanned: one added
      // since the last full scan.
      const state = this.data.state(on);
      if (!state.scan && !state.error && this.scanCard(on, viewed, cx)) changed = true;
    }
    return changed;
  }

  // Scans every machine at once (a machine already being scanned keeps its
  // scan) and says whether the viewed machine's scan started (see keepFresh).
  scanAll(viewed, cx) {
    this.scannedAt = Date.now();
    let changed = false;
    for (const on of this.names(viewed)) if (this.scanCard(on, viewed, cx)) changed = true;
    return changed;
  }

  // Starts machine `on`'s scan and says whether it is the viewed machine's.
  // Its result redraws only when its card would read differently from the
  // last frame; the viewed machine's always does (the footer says when it was
  // checked).
  scanCard(on, viewed, cx) {
    return this.data.scan(on, cx, () => this.unchanged(on)) && machineKey(on) === machineKey(viewed);
  }

  unchanged(on) {
    const viewed = viewedMachine();
    if (machineKey(on) === machineKey(viewed)) return false;
    return this.drawn.get(machineKey(on)) === JSON.stringify(machineCard(on, this.data.state(on), viewed));
  }

  names(viewed) {
    return cardMachines(machines(), spaces(), viewed);
  }

  render(viewed, _state, t, ts) {
    const cards = machineCards({ machines: machines(), spaces: spaces(), viewed, stateOf: (on) => this.data.state(on) });
    this.drawn = new Map(cards.map(({ on, ...card }) => [machineKey(on), JSON.stringify(card)]));
    return v_flex()
      .flex_1()
      .min_h(0)
      .child(this.followRow(following(machineChoice()), t, ts))
      .child(this.cardList(cards, t, ts));
  }

  followRow(follow, t, ts) {
    return h_flex()
      .h(SIZE.followRow)
      .flex_none()
      .px(14)
      .gap(10)
      .items_center()
      .border_b(1)
      .border_color(t.border)
      .text_size(ts.base)
      .child(div().flex_1().min_w(0).truncate().child("Follow the shown space"))
      .child(
        toggleSwitch("sg-follow", follow, false, (checked) => setMachineChoice(followChoice(checked, viewedMachine())), t),
      );
  }

  // The only part of the tab that scrolls.
  cardList(cards, t, ts) {
    return div()
      .flex_1()
      .min_h(0)
      .relative()
      .child(
        v_flex()
          .id("sg-cards")
          .absolute()
          .inset_0()
          .overflow_y_scroll()
          .p(10)
          .gap(8)
          .children(cards.map((card) => this.card(card, t, ts))),
      )
      .child(Scrollbar.vertical("sg-cards").absolute().inset_0());
  }

  // `card` is machineCards(...)'s: { on, label, viewing, dot, summary, topTools, problem }.
  card(card, t, ts) {
    const dot = card.dot === "ok" ? t.done : card.dot === "off" ? t.ansi1 : t.dim;
    const counts = card.summary || (card.dot === "loading" ? "Checking…" : "");
    return v_flex()
      .id(`sg-card-${card.on === null ? "local" : "m-" + card.on}`)
      .flex_none()
      .px(12)
      .py(10)
      .gap(6)
      .rounded(10)
      .border_1()
      .border_color(card.viewing ? t.accent : t.border)
      .bg(t.raised)
      .cursor_pointer()
      .hover((s) => s.bg(t.hover))
      .on_click((_e, cx) => this.choose(card.on, cx))
      .when(card.dot === "loading", (el) => el.loop("opacity", PULSE))
      .child(
        h_flex()
          .gap(8)
          .items_center()
          .child(div().size(SIZE.dot).flex_none().rounded_full().bg(dot))
          .child(div().flex_1().min_w(0).truncate().font_semibold().text_color(t.foreground).child(card.label))
          .when(card.viewing, (el) => el.child(this.tag("Viewing", t.accent, t.accent, t, ts))),
      )
      .when(Boolean(counts), (el) => el.child(div().text_size(ts.small).text_color(t.muted).child(counts)))
      .when(card.topTools.length > 0, (el) =>
        el.child(h_flex().flex_wrap().gap(6).children(card.topTools.map((name) => this.tag(name, t.muted, t.border, t, ts)))),
      )
      .when(Boolean(card.problem), (el) =>
        el.child(div().text_size(ts.small).text_color(card.dot === "off" ? t.ansi1 : t.blocked).child(card.problem)),
      );
  }

  tag(text, color, border, t, ts) {
    return h_flex()
      .h(SIZE.tag)
      .px(7)
      .flex_none()
      .items_center()
      .rounded_full()
      .border_1()
      .border_color(border)
      .bg(t.background)
      .text_size(ts.micro)
      .text_color(color)
      .child(text);
  }

  // A card click: view that machine (following stops) and open Installed.
  choose(on, cx) {
    setMachineChoice(viewChoice(on));
    this.select("installed", cx);
  }
}
