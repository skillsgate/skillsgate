// The skill role: one skill's dialog (props { role, on, key }), with its
// Document and Tools tabs and a footer with delete.
//
// It reads for itself: a scan of its machine when it opens and again whenever
// the machine's revision changes (a request finished), and SKILL.md once. A
// skill that is gone after a scan closes the dialog. Its switches and its
// delete button post requests; they are disabled while the machine is busy or
// a request it sent has no outcome yet (requestPending).

import { div, svg } from "gpui-kit";
import { h_flex, v_flex, Scrollbar, Switch, TextView } from "gpui-base";
import { closeOverlay, knownAgents, props, theme } from "herdr";
import { channel, errorText, machine, readText } from "./host.js";
import { SIZE, button, dialogCard, icon, iconButton, spinner, tabButton, textSizes, toolMarkBox } from "./ui.js";
import { machineLabel, shortPath } from "./model.js";
import { cantCheckText, deleteLabel, requestPending, skillDocument, toolRows, toolsNote } from "./view-model.js";

const DIALOG_TABS = [
  ["document", "Document"],
  ["tools", "Tools"],
];
const ARM_MS = 4000; // how long the delete button stays armed

export default class SkillDialog {
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

  // Esc closes the dialog. (Not named `key`: that field is the skill's key.)
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
      this.read(cx);
    }
    const card = dialogCard("sg-skill", this.handle, (e, cx) => this.onKey(e, cx), t, ts);
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
      .child(toolMarkBox(this.programs, row, t, ts))
      .child(div().flex_1().min_w(0).truncate().child(row.label))
      .when(row.control === "switch", (el) => el.child(this.switchFor(row, locked, t)))
      .when(row.control === "shared", (el) => el.child(div().flex_none().text_size(ts.small).text_color(t.muted).child("Shared copy")))
      .when(row.control === "none" && row.on, (el) => el.child(svg(icon("check")).size(SIZE.icon).flex_none().text_color(t.muted)));
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
          .when(Boolean(busy), (el) => el.child(spinner(t)).child(div().min_w(0).truncate().child(busy))),
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
