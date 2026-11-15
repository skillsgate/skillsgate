// Sizes, text sizes and the small widgets several views share: buttons, tabs,
// switches, the dialog card, a tool's mark, the spinner, skeleton rows, the
// status line and the same status inline. It imports no view.

import { div, image, svg } from "gpui-kit";
import { h_flex, v_flex, Switch, TextView } from "gpui-base";
import { settings } from "herdr";
import { MOD } from "./host.js";
import { openableHref, toolMark } from "./view-model.js";

export const MARK = `mods/${MOD}/mark.svg`;
export const icon = (name) => `mods/${MOD}/icons/${name}.svg`;

// ---- Sizes, in px at zoom 1 (Herdr applies the person's zoom) ----
// The button's 118px width and the panel's 400px (380 to 720) are set on the
// layout nodes "skillsgate-toggle" and "skillsgate-panel".

export const SIZE = {
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
  // the Machines tab
  followRow: 44,
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
  // Discover and the catalog dialog
  tag: 20, // the "Installed" tag
  checklistWidth: 250,
  checkRow: 36,
  checkBox: 16,
};
export const DIALOG = { width: 760, height: 560 };

// Text sizes follow the person's UI font size. Inside a mod, settings() reports
// it at zoom 1 (`herdr-app status` shows it zoomed), and Herdr zooms a mod's
// sizes itself, so it is used as it is.
export function textSizes() {
  const size = Number((settings() ?? {}).ui_font_size);
  const base = size > 0 ? size : 13;
  return { title: base + 2, base, small: base - 1, tiny: base - 2, micro: base - 3 };
}

// ---- Small shared pieces ----

export function iconButton(id, name, onClick, t) {
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

// A disabled button is dimmed and takes no clicks.
export function button(id, label, onClick, t, ts, primary = false, disabled = false) {
  const el = h_flex()
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
    .child(label);
  if (disabled) return el.opacity(0.5);
  return el.cursor_pointer().hover((s) => s.opacity(0.88)).on_click(onClick);
}

// One tab of a tab bar (the panel's and the skill dialog's).
export function tabButton(id, label, active, onClick, t, ts) {
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

// gpui-base's Switch, drawn in the theme's colors (it comes unstyled).
// `onChange(checked, cx)` gets the new position. A disabled switch is dimmed
// and takes no clicks.
export function toggleSwitch(id, on, disabled, onChange, t) {
  return Switch.new(id)
    .checked(on)
    .disabled(disabled)
    .on_change(onChange)
    .w(SIZE.switchWidth)
    .h(SIZE.switchHeight)
    .flex_none()
    .flex()
    .items_center()
    .p(2)
    .rounded_full()
    .bg(on ? t.accent : t.hover)
    .when(on, (el) => el.justify_end())
    .when(disabled, (el) => el.opacity(0.5))
    .when(!disabled, (el) => el.cursor_pointer())
    .child(div().size(SIZE.knob).rounded_full().bg(on ? t.accent_foreground : t.muted));
}

// Placeholder rows while a tab's first result is on its way (the first scan
// of a machine, the first search).
export function skeletonRows(t) {
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

// The turning icon beside work in progress.
export function spinner(t) {
  return svg(icon("refresh")).size(SIZE.smallIcon).flex_none().text_color(t.working).spin(900);
}

// The color and the leading mark of a status (statusOf): the spinner and
// muted text for work running, a check in the done color, or a dot in the
// warning or error color.
function statusLook(status, t) {
  if (status.kind === "busy") return { color: t.muted, mark: spinner(t) };
  const color = status.kind === "done" ? t.done : status.kind === "warn" ? t.blocked : t.ansi1;
  const mark =
    status.kind === "done" ? svg(icon("check")).size(SIZE.smallIcon).flex_none() : div().size(SIZE.dot).flex_none().rounded_full().bg(color);
  return { color, mark };
}

// `status` is statusOf(...): work running on the viewed machine, or a notice.
export function statusLine(status, t, ts) {
  const { color, mark } = statusLook(status, t);
  return h_flex()
    .h(SIZE.status)
    .flex_none()
    .px(14)
    .gap(8)
    .items_center()
    .border_b(1)
    .border_color(t.border)
    .text_size(ts.small)
    .text_color(color)
    .child(mark)
    .child(div().flex_1().min_w(0).truncate().child(status.text));
}

// The same status inside a row (the skill dialog's footer): the mark and one
// line of text, cut with an ellipsis.
export function statusInline(status, t) {
  const { color, mark } = statusLook(status, t);
  return h_flex().min_w(0).gap(8).items_center().text_color(color).child(mark).child(div().min_w(0).truncate().child(status.text));
}

// A dialog's own card (dialogs open with frame "none"), holding the keyboard
// for Esc.
export function dialogCard(id, handle, onKeyDown, t, ts) {
  return v_flex()
    .id(id)
    .track_focus(handle)
    .on_key_down(onKeyDown)
    .size_full()
    .min_h(0)
    .rounded(12)
    .overflow_hidden()
    .border_1()
    .border_color(t.border)
    .bg(t.popover)
    .text_color(t.foreground)
    .text_size(ts.base);
}

// Markdown the mod did not write (a skill's SKILL.md, capped by the caller),
// rendered selectable. A link click replaces TextView's own opener: only a
// URL openableHref allows goes to cx.open_url, as its parsed href (never the
// raw string), and Herdr's http(s) guard applies too; a URL it refuses does
// nothing, and so does every other link.
export function markdownView(id, text) {
  return TextView.markdown(id, text)
    .selectable(true)
    .on_link_click((url, cx) => {
      const href = openableHref(url);
      if (!href) return;
      try {
        cx.open_url(href);
      } catch {
        // refused: the click does nothing
      }
    });
}

// A tool's mark: Herdr's own for the tool's program (`programs` is
// knownAgents(), or null while it loads), else its two-letter badge.
export function toolMarkBox(programs, tool, t, ts) {
  const box = div().size(SIZE.markBox).flex_none().flex().items_center().justify_center();
  const mark = toolMark(programs, tool.program);
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
    .child(tool.shortCode);
}
