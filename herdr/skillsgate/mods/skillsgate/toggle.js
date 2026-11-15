// The toggle role: the tab-bar button that shows and hides the panel's
// layout node, on `selected` while the panel is open.

import { div, svg } from "gpui-kit";
import { h_flex } from "gpui-base";
import { run, theme } from "herdr";
import { PANEL, panelNode } from "./host.js";
import { MARK, SIZE, textSizes } from "./ui.js";

export default class Toggle {
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
