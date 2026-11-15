// The catalog role: one skills.sh skill's dialog (props { role, on, row }):
// its SKILL.md from GitHub, a checklist of the tools on machine `on`, and
// Install.
//
// It reads for itself: SKILL.md once, and a scan of its machine when it opens
// and again whenever the machine's revision changes (a request finished), for
// the tool list, git, and whether the install would be an update. The checked
// tools start from those remembered for the machine (else defaultTargets).
// Install remembers them, hands the request to the panel and closes at once;
// it is disabled, with the reason beside it, while the machine is busy, while
// the dialog's scan runs or failed, and when the machine has no git.

import { div, svg } from "gpui-kit";
import { h_flex, v_flex, Checkbox, Scrollbar } from "gpui-base";
import { closeOverlay, knownAgents, props, setShared, shared, theme } from "herdr";
import { TARGETS, catalog, channel, errorText, machine } from "./host.js";
import { SIZE, button, dialogCard, icon, iconButton, markdownView, spinner, textSizes, toolMarkBox } from "./ui.js";
import { validSkillId, validSource } from "./catalog.js";
import { machineInSentence, plainName } from "./model.js";
import { catalogPreview, checklist, formatInstalls, installAction, startTargets, storeNote, withTargets } from "./view-model.js";

const stringOr = (value) => (typeof value === "string" ? value : "");

export default class CatalogDialog {
  init(cx) {
    const p = props() ?? {};
    const row = p.row !== null && typeof p.row === "object" ? p.row : {};
    this.on = typeof p.on === "string" && p.on ? p.on : null; // null: this computer
    this.row = { source: stringOr(row.source), skillId: stringOr(row.skillId), installs: Number(row.installs) || 0 };
    this.row.name = plainName(row.name) || this.row.skillId;
    this.row.installable = validSource(this.row.source) && validSkillId(this.row.skillId);
    this.overlay = p.overlay;
    this.preview = null; // catalogPreview(...) once SKILL.md is fetched (or not)
    this.seen = {}; // the dialog's scan: { scan, skills } once one worked, { error } when the first failed
    this.checked = null; // the checked tool names, from the first good scan on
    this.programs = null; // knownAgents(), for the tool marks; [] if it failed
    this.rev = channel.rev(this.on); // the revision the latest scan was asked at
    this.reading = false;
    this.again = false; // a scan was asked for while one ran
    this.closed = false;
    this.handle = cx.focus_handle();
    this.handle.focus();
    this.load(cx);
    cx.spawn(async (cx) => {
      let text = null;
      try {
        text = await catalog.content(this.row.source, this.row.skillId);
      } catch {
        // Preview unavailable; Install still works.
      }
      this.preview = catalogPreview(text);
      if (!this.closed) cx.notify();
    });
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

  // Scans the machine; asked for while a scan runs, it scans once more after
  // it. A failed scan after a good one keeps the good one. It may be called
  // from render: the work begins after the frame.
  load(cx) {
    if (this.reading) {
      this.again = true;
      return;
    }
    this.reading = true;
    cx.spawn(async (cx) => {
      await cx.sleep(0);
      do {
        this.again = false;
        let r;
        try {
          r = await machine.scan(this.on);
        } catch (error) {
          r = { ok: false, error: errorText(error) };
        }
        if (this.closed) return;
        if (r.ok) {
          this.seen = { scan: r.scan, skills: r.skills };
          if (!this.checked) this.checked = new Set(startTargets(shared(TARGETS), this.on, r.scan, r.skills));
        } else if (!this.seen.scan) {
          this.seen = { error: r.error };
        }
      } while (this.again);
      this.reading = false;
      cx.notify();
    });
  }

  action() {
    return installAction({ on: this.on, row: this.row, read: this.seen, busy: channel.textAt(this.on) });
  }

  toggle(name, checked, cx) {
    if (!this.checked) return;
    const next = new Set(this.checked);
    if (checked) next.add(name);
    else next.delete(name);
    this.checked = next;
    cx.notify();
  }

  // Remembers the checked tools for this machine, hands the install to the
  // panel and closes. Only the tools the checklist lists are sent, and
  // `replace` is the decision that drew the button's label and the replace
  // line.
  install() {
    const action = this.action();
    if (action.reason) return;
    const tools = checklist(this.seen.scan, this.checked)
      .filter((r) => r.checked)
      .map((r) => r.name);
    setShared(TARGETS, withTargets(shared(TARGETS), this.on, tools));
    const { source, skillId, name } = this.row;
    channel.request({ op: "install", on: this.on, source, skillId, name, tools, replace: action.replace });
    this.close();
  }

  // Esc closes the dialog.
  onKey(e, cx) {
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
      this.load(cx);
    }
    const action = this.action();
    return dialogCard("sg-catalog", this.handle, (e, cx) => this.onKey(e, cx), t, ts)
      .child(this.header(t, ts))
      .child(h_flex().flex_1().min_h(0).items_stretch().child(this.previewPane(t, ts)).child(this.toolPane(t, ts)))
      .child(this.footer(action, t, ts));
  }

  // The name, owner/repo and the installs.
  header(t, ts) {
    const { name, source, installs } = this.row;
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
          .child(div().truncate().text_size(ts.title).font_semibold().child(name))
          .child(
            h_flex()
              .min_w(0)
              .gap(6)
              .text_size(ts.small)
              .text_color(t.muted)
              .child(div().min_w(0).truncate().child(source))
              .child(div().flex_none().text_color(t.dim).child("·"))
              .child(div().flex_none().child(`${formatInstalls(installs)} installs`)),
          ),
      )
      .child(iconButton("sg-catalog-close", "close", () => this.close(), t));
  }

  // SKILL.md as the catalog has it: the description, then the body rendered
  // without its frontmatter.
  previewPane(t, ts) {
    const preview = this.preview;
    const body = v_flex()
      .id("sg-catalog-doc")
      .absolute()
      .inset_0()
      .overflow_y_scroll()
      .px(20)
      .py(16)
      .gap(14)
      .when(!preview, (el) => el.child(div().text_color(t.dim).child("Loading preview…")))
      .when(Boolean(preview?.message), (el) => el.child(div().text_size(ts.small).text_color(t.muted).child(preview.message)))
      .when(Boolean(preview?.description), (el) => el.child(div().text_color(t.muted).child(preview.description)))
      .when(Boolean(preview?.body?.trim()), (el) => el.child(markdownView("sg-catalog-md", preview.body)));
    return div().flex_1().min_w(0).min_h(0).relative().child(body).child(Scrollbar.vertical("sg-catalog-doc").absolute().inset_0());
  }

  // The machine's detected tools to add the skill to, and a line saying the
  // shared store always gets it.
  toolPane(t, ts) {
    const scan = this.seen.scan;
    const rows = scan ? checklist(scan, this.checked) : [];
    let empty = null;
    if (!scan) empty = this.seen.error ? "Can't list the tools." : "Loading…";
    else if (!rows.length) empty = `No other tools found on ${machineInSentence(this.on)}.`;
    const list = v_flex()
      .id("sg-catalog-tools")
      .absolute()
      .inset_0()
      .overflow_y_scroll()
      .px(8)
      .pb(8)
      .gap(2)
      .when(Boolean(empty), (el) => el.child(div().px(8).py(6).text_size(ts.small).text_color(t.dim).child(empty)))
      .children(rows.map((row) => this.toolRow(row, t, ts)));
    return v_flex()
      .w(SIZE.checklistWidth)
      .flex_none()
      .min_h(0)
      .border_l(1)
      .border_color(t.border)
      .child(div().flex_none().px(16).pt(14).pb(6).text_size(ts.tiny).font_semibold().text_color(t.dim).child("ADD TO TOOLS"))
      .child(div().flex_1().min_h(0).relative().child(list).child(Scrollbar.vertical("sg-catalog-tools").absolute().inset_0()))
      .child(
        div()
          .flex_none()
          .px(16)
          .py(12)
          .border_t(1)
          .border_color(t.border)
          .text_size(ts.small)
          .text_color(t.muted)
          .child(storeNote(scan)),
      );
  }

  // The whole row is the checkbox.
  toolRow(row, t, ts) {
    const box = div()
      .size(SIZE.checkBox)
      .flex_none()
      .flex()
      .items_center()
      .justify_center()
      .rounded(4)
      .border_1()
      .border_color(row.checked ? t.accent : t.input)
      .bg(row.checked ? t.accent : t.background)
      .text_color(t.accent_foreground)
      .when(row.checked, (el) => el.child(svg(icon("check")).size(SIZE.tinyIcon)));
    return Checkbox.new(`sg-catalog-tool-${row.name}`)
      .checked(row.checked)
      .on_change((checked, cx) => this.toggle(row.name, checked, cx))
      .h(SIZE.checkRow)
      .flex_none()
      .flex()
      .items_center()
      .gap(10)
      .px(8)
      .rounded(8)
      .cursor_pointer()
      .hover((s) => s.bg(t.hover))
      .child(box)
      .child(toolMarkBox(this.programs, row, t, ts))
      .child(div().flex_1().min_w(0).truncate().child(row.label));
  }

  // At the left, why Install is disabled and what an install would replace;
  // Cancel and Install at the right. The replace line wraps when it is alone.
  footer(action, t, ts) {
    const reason = h_flex()
      .min_w(0)
      .gap(8)
      .items_center()
      .text_color(t.muted)
      .when(action.working, (el) => el.child(spinner(t)))
      .child(div().min_w(0).truncate().child(action.reason ?? ""));
    const note = div()
      .min_w(0)
      .text_color(t.blocked)
      .when(Boolean(action.reason), (el) => el.truncate())
      .child(action.note ?? "");
    return h_flex()
      .h(SIZE.dialogFooter)
      .flex_none()
      .px(16)
      .gap(12)
      .items_center()
      .border_t(1)
      .border_color(t.border)
      .child(
        v_flex()
          .flex_1()
          .min_w(0)
          .gap(2)
          .justify_center()
          .text_size(ts.small)
          .when(Boolean(action.reason), (el) => el.child(reason))
          .when(Boolean(action.note), (el) => el.child(note)),
      )
      .child(button("sg-catalog-cancel", "Cancel", () => this.close(), t, ts))
      .child(button("sg-catalog-install", action.label, () => this.install(), t, ts, true, Boolean(action.reason)));
  }
}
