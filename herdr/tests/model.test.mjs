import test from "node:test";
import assert from "node:assert/strict";
import {
  activeTool,
  ago,
  cantCheckText,
  catalogPreview,
  catalogRows,
  checklist,
  clockRegions,
  defaultTargets,
  deleteLabel,
  discoverView,
  dropFromLock,
  effectiveMachine,
  emptyText,
  filterSkills,
  footerText,
  formatInstalls,
  inStore,
  installAction,
  installedBody,
  installedFolders,
  layoutNode,
  lockPath,
  machineInSentence,
  machineKey,
  machineLabel,
  machineNames,
  machineUnavailable,
  scanNotice,
  statusOf,
  mergeLock,
  noticeShown,
  parseFrontmatter,
  parseScan,
  regionsChanged,
  relativePath,
  requestPending,
  sanitizeName,
  searchKey,
  sections,
  shortPath,
  skillDocument,
  startTargets,
  storeNote,
  stripFrontmatter,
  summaryText,
  toolByName,
  toolChips,
  toolLabel,
  toolMark,
  toolRows,
  toolsNote,
  toolSummary,
  withTargets,
} from "../skillsgate/mods/skillsgate/model.js";
import { createMachine } from "../skillsgate/mods/skillsgate/machine.js";
import { FIXTURE, makeHome } from "./helpers.mjs";

test("parseFrontmatter reads name and description", () => {
  assert.deepEqual(parseFrontmatter('---\nname: "pdf"\ndescription: Read PDFs\n---\n', "x"), { name: "pdf", description: "Read PDFs" });
});
test("parseFrontmatter joins a folded description and takes CRLF", () => {
  assert.deepEqual(parseFrontmatter("---\r\nname: a\r\ndescription: >-\r\n  one\r\n  two\r\n---\r\n", "x"), { name: "a", description: "one two" });
});
test("parseFrontmatter falls back to the folder", () => {
  assert.deepEqual(parseFrontmatter("# Title\n", "my-folder"), { name: "my-folder", description: "" });
  assert.deepEqual(parseFrontmatter("", "my-folder"), { name: "my-folder", description: "" });
});
test("parseScan refuses output without a header", () => assert.throws(() => parseScan("sh: not found"), /Unreadable scan/));
test("relativePath", () => {
  assert.equal(relativePath("/h/.cursor/skills", "/h/.agents/skills/alpha"), "../../.agents/skills/alpha");
  assert.equal(relativePath("/h/.config/zed/skills", "/h/.agents/skills/a"), "../../../.agents/skills/a");
  assert.equal(relativePath("/a/b", "/c/d"), "../../c/d");
});
test("sanitizeName", () => {
  assert.equal(sanitizeName("My Skill!"), "my-skill");
  assert.equal(sanitizeName("pdf"), "pdf");
});
test("toolByName", () => {
  const tools = [{ name: "a" }, { name: "b" }];
  assert.equal(toolByName(tools, "b"), tools[1]);
  assert.equal(toolByName(tools, "z"), undefined);
});
test("machineKey and machineLabel", () => {
  assert.equal(machineKey(null), "");
  assert.equal(machineKey("sulvali"), "sulvali");
  assert.equal(machineLabel(null), "This computer");
  assert.equal(machineLabel("sulvali"), "sulvali");
});
test("lockPath", () => assert.equal(lockPath({ home: "/h" }), "/h/.agents/.skill-lock.json"));
test("mergeLock starts a lock and keeps installedAt", () => {
  const a = JSON.parse(mergeLock(null, "pdf", "anthropics/skills", "2026-11-15T10:00:00.000Z").text);
  assert.deepEqual(a, { version: 1, skills: { pdf: { source: "anthropics/skills", sourceType: "github", originalUrl: "anthropics/skills",
    skillFolderHash: "", installedAt: "2026-11-15T10:00:00.000Z", updatedAt: "2026-11-15T10:00:00.000Z" } } });
  const b = JSON.parse(mergeLock(JSON.stringify(a), "pdf", "anthropics/skills", "2026-11-16T10:00:00.000Z").text);
  assert.equal(b.skills.pdf.installedAt, "2026-11-15T10:00:00.000Z");
  assert.equal(b.skills.pdf.updatedAt, "2026-11-16T10:00:00.000Z");
});
test("mergeLock writes JSON.stringify(lock, null, 2) and starts from an empty file", () => {
  const { text } = mergeLock("  \n", "pdf", "a/b", "t");
  assert.equal(text, JSON.stringify(JSON.parse(text), null, 2));
  assert.deepEqual(Object.keys(JSON.parse(text).skills.pdf), ["source", "sourceType", "originalUrl", "skillFolderHash", "installedAt", "updatedAt"]);
});
test("mergeLock skips a lock it can't read", () => {
  assert.deepEqual(mergeLock("{nope", "pdf", "a/b", "t"), { skip: "invalid" });
  assert.deepEqual(mergeLock('{"version":2,"skills":{}}', "pdf", "a/b", "t"), { skip: "invalid" });
  assert.deepEqual(mergeLock('{"version":1,"skills":[]}', "pdf", "a/b", "t"), { skip: "invalid" });
  assert.deepEqual(mergeLock('{"version":1,"skills":null}', "pdf", "a/b", "t"), { skip: "invalid" });
  assert.deepEqual(mergeLock("[]", "pdf", "a/b", "t"), { skip: "invalid" });
});
test("mergeLock skips a lock over 96 KiB", () => {
  const big = JSON.stringify({ version: 1, skills: { x: { source: "y".repeat(100 * 1024) } } });
  assert.deepEqual(mergeLock(big, "pdf", "a/b", "t"), { skip: "large" });
});
test("mergeLock counts the limit in UTF-8 bytes", () => {
  const lock = (source) => JSON.stringify({ version: 1, skills: { x: { source } } });
  assert.deepEqual(mergeLock(lock("é".repeat(50000)), "pdf", "a/b", "t"), { skip: "large" }); // 2 bytes each
  assert.deepEqual(mergeLock(lock("😀".repeat(25000)), "pdf", "a/b", "t"), { skip: "large" }); // 4 bytes each
  assert.equal(typeof mergeLock(lock("é".repeat(40000)), "pdf", "a/b", "t").text, "string");
  assert.equal(typeof mergeLock(lock("😀".repeat(20000)), "pdf", "a/b", "t").text, "string");
});
test("dropFromLock", () => {
  const lock = JSON.stringify({ version: 1, skills: { pdf: {}, docx: {} } });
  assert.deepEqual(Object.keys(JSON.parse(dropFromLock(lock, "pdf").text).skills), ["docx"]);
  assert.deepEqual(dropFromLock(lock, "nope"), { skip: "absent" });
  assert.deepEqual(dropFromLock(null, "pdf"), { skip: "absent" });
  assert.deepEqual(dropFromLock("{nope", "pdf"), { skip: "invalid" });
  assert.deepEqual(dropFromLock('{"version":2,"skills":{"pdf":{}}}', "pdf"), { skip: "invalid" });
});

// View helpers. A skill as buildSkills makes it, with only what the helpers read.
const sk = (name, home, tools, extra = {}) =>
  ({ key: `/r/${name}`, real: `/r/${name}`, folder: name, name, description: "", home, tools, entries: [], ...extra });

test("effectiveMachine", () => {
  assert.equal(effectiveMachine(undefined, "vps"), "vps");
  assert.equal(effectiveMachine({ follow: true, on: "x" }, null), null);
  assert.equal(effectiveMachine({ follow: false, on: "vps" }, null), "vps");
  assert.equal(effectiveMachine({ follow: false, on: null }, "vps"), null);
});
test("effectiveMachine reads a malformed choice as following", () => {
  assert.equal(effectiveMachine(null, "vps"), "vps");
  assert.equal(effectiveMachine("vps", null), null);
  assert.equal(effectiveMachine({ follow: false, on: 7 }, "vps"), null);
  assert.equal(effectiveMachine(undefined, undefined), null);
});
test("machineNames", () => {
  assert.deepEqual(machineNames([{ name: null }, { name: "vps" }], [{ machine: "box" }, { machine: null }, { machine: "vps" }]), [null, "box", "vps"]);
});
test("machineNames with no machines or spaces is this computer only", () => {
  assert.deepEqual(machineNames([], []), [null]);
  assert.deepEqual(machineNames([{ name: "zz" }, { name: "aa" }], []), [null, "aa", "zz"]);
});
test("machineNames sorts without case, then by code unit", () => {
  const list = [{ name: "Zed" }, { name: "alpha" }, { name: "beta" }, { name: "Alpha" }];
  assert.deepEqual(machineNames(list, [{ machine: "box" }]), [null, "Alpha", "alpha", "beta", "box", "Zed"]);
});
test("machineUnavailable reads Herdr's machines() by machine key", () => {
  const list = [{ name: null, layout: "ready" }, { name: "vps", layout: "unavailable" }, { name: "box", layout: "loading" }];
  assert.equal(machineUnavailable(list, "vps"), true);
  assert.equal(machineUnavailable(list, ""), false);
  assert.equal(machineUnavailable(list, "box"), false);
  assert.equal(machineUnavailable(list, "gone"), false);
  assert.equal(machineUnavailable([{ name: null, layout: "unavailable" }], ""), true);
});
test("layoutNode finds a node by id anywhere in the layout", () => {
  const tree = {
    id: "root",
    children: [
      { id: "work", children: [{ id: "tabs" }, { id: "body", children: [{ id: "skillsgate-panel", hidden: true, children: [] }] }] },
    ],
  };
  assert.equal(layoutNode(tree, "root"), tree);
  assert.equal(layoutNode(tree, "tabs").id, "tabs");
  assert.equal(layoutNode(tree, "skillsgate-panel").hidden, true);
  assert.equal(layoutNode(tree, "missing"), null);
  assert.equal(layoutNode(null, "root"), null);
  assert.equal(layoutNode(undefined, "root"), null);
});
test("activeTool keeps a chip only while this machine has it", () => {
  const chips = [{ name: "cursor" }, { name: "universal" }];
  assert.equal(activeTool(chips, "cursor"), "cursor");
  assert.equal(activeTool(chips, "zed"), null);
  assert.equal(activeTool(chips, null), null);
  assert.equal(activeTool([], "cursor"), null);
});
test("installedBody: rows once a scan worked, the error only before any good scan", () => {
  const skills = [sk("a", "store", ["universal"])];
  assert.equal(installedBody(undefined), "skeleton");
  assert.equal(installedBody({ skills: null, error: null, loading: true }), "skeleton");
  assert.equal(installedBody({ skills: null, error: "machine vps is unreachable" }), "error");
  assert.equal(installedBody({ skills: null, error: "machine vps is unreachable", loading: true }), "error");
  assert.equal(installedBody({ skills, error: null }), "rows");
  assert.equal(installedBody({ skills, error: "machine vps is unreachable" }), "rows");
  assert.equal(installedBody({ skills: [], error: null }), "empty");
  assert.equal(installedBody({ skills: [], error: "machine vps is unreachable" }), "empty");
});
test("scanNotice reports a failed re-scan once per new error", () => {
  const good = { skills: [sk("a", "store", ["universal"])], error: null };
  assert.equal(scanNotice(null, good, "sh: timeout"), "Can't check this computer: sh: timeout");
  assert.equal(scanNotice("vps", good, "machine vps is unreachable"), "Can't check vps: machine vps is unreachable");
  // The same error again says nothing; a different one does.
  assert.equal(scanNotice("vps", { ...good, error: "machine vps is unreachable" }, "machine vps is unreachable"), null);
  assert.equal(scanNotice("vps", { ...good, error: "machine vps is unreachable" }, "Unreadable scan"), "Can't check vps: Unreadable scan");
  // No good scan yet: the error view says it, not a notice.
  assert.equal(scanNotice("vps", { skills: null, error: null }, "machine vps is unreachable"), null);
  assert.equal(scanNotice("vps", undefined, "machine vps is unreachable"), null);
});
test("statusOf: work in progress, else a notice that has not run out", () => {
  const done = { kind: "done", text: "Added", at: 0 };
  assert.deepEqual(statusOf("Adding pdf to Cursor…", done, 1000), { kind: "busy", text: "Adding pdf to Cursor…" });
  assert.deepEqual(statusOf(null, done, 1000), { kind: "done", text: "Added" });
  assert.equal(statusOf(null, done, 4000), null);
  assert.deepEqual(statusOf("", { kind: "error", text: "Failed", at: 0 }, 7000), { kind: "error", text: "Failed" });
  assert.equal(statusOf(null, null, 0), null);
});
test("filterSkills by text and by tool", () => {
  const skills = [
    sk("docx", "store", ["cursor", "universal"], { description: "Word documents" }),
    sk("pdf-tools", "store", ["claude-code", "universal"], { description: "Fill forms" }),
    sk("reader", "tool", ["cursor"], { folder: "my-reader", description: "Reads PDF and EPUB" }),
  ];
  const names = (list) => list.map((s) => s.name);
  assert.deepEqual(names(filterSkills(skills, { query: "PDF" })), ["pdf-tools", "reader"]);
  assert.deepEqual(names(filterSkills(skills, { query: "epub" })), ["reader"]);
  assert.deepEqual(names(filterSkills(skills, { query: "MY-READ" })), ["reader"]);
  assert.deepEqual(names(filterSkills(skills, { tool: "cursor" })), ["docx", "reader"]);
  assert.deepEqual(names(filterSkills(skills, { query: "pdf", tool: "cursor" })), ["reader"]);
  assert.deepEqual(names(filterSkills(skills, { query: "  ", tool: null })), ["docx", "pdf-tools", "reader"]);
  assert.deepEqual(names(filterSkills(skills, {})), ["docx", "pdf-tools", "reader"]);
});
test("sections omit empty groups and keep the order", () => {
  const out = sk("out", "external", ["cursor"]);
  const a = sk("a", "store", ["universal"]);
  const b = sk("b", "store", ["claude-code", "universal"]);
  assert.deepEqual(sections([out, a, b]), [
    { id: "store", title: "SHARED", rows: [a, b] },
    { id: "external", title: "LINKED FROM ELSEWHERE", rows: [out] },
  ]);
  const solo = sk("solo", "tool", ["claude-code"]);
  assert.deepEqual(sections([solo, out, a]).map((s) => [s.id, s.title, s.rows.length]), [
    ["store", "SHARED", 1],
    ["tool", "IN ONE TOOL", 1],
    ["external", "LINKED FROM ELSEWHERE", 1],
  ]);
  assert.deepEqual(sections([]), []);
});
test("toolChips counts per tool in registry order", () => {
  const scan = { tools: [{ name: "claude-code" }, { name: "cursor" }, { name: "windsurf" }, { name: "universal" }] };
  const skills = [
    sk("a", "store", ["cursor", "universal"]),
    sk("b", "tool", ["claude-code"]),
    sk("c", "store", ["claude-code", "cursor", "universal"]),
    sk("d", "store", ["universal"]),
  ];
  assert.deepEqual(toolChips(scan, skills), [
    { name: "claude-code", displayName: "Claude Code", shortCode: "CC", count: 2 },
    { name: "cursor", displayName: "Cursor", shortCode: "CU", count: 2 },
    { name: "universal", displayName: "Universal (.agents/skills)", shortCode: "UA", count: 3 },
  ]);
  assert.deepEqual(toolChips(scan, []), []);
});
test("toolLabel drops the folder note and falls back to the name", () => {
  assert.equal(toolLabel("universal"), "Universal");
  assert.equal(toolLabel("claude-code"), "Claude Code");
  assert.equal(toolLabel("no-such-tool"), "no-such-tool");
});
test("toolSummary names the one tool or counts them", () => {
  assert.equal(toolSummary(sk("a", "tool", ["cursor"])), "Cursor");
  assert.equal(toolSummary(sk("b", "store", ["universal"])), "Universal");
  assert.equal(toolSummary(sk("c", "store", ["claude-code", "cursor", "universal"])), "3 tools");
});
test("summaryText counts skills and the tools that have one", () => {
  const scan = { tools: [{ name: "claude-code" }, { name: "cursor" }, { name: "universal" }] };
  assert.equal(summaryText(scan, [sk("a", "store", ["cursor", "universal"]), sk("b", "tool", ["claude-code"])]), "2 skills · 3 tools");
  assert.equal(summaryText(scan, [sk("b", "tool", ["claude-code"])]), "1 skill · 1 tool");
  assert.equal(summaryText(scan, []), "0 skills · 0 tools");
});
test("footerText", () => {
  const scan = { tools: [{ name: "cursor" }] };
  assert.equal(footerText({ scan, skills: [sk("a", "tool", ["cursor"])], at: 1000 }, 13000), "1 skill · 1 tool · checked 10s ago");
  assert.equal(footerText({ loading: true }, 0), "Checking…");
  assert.equal(footerText({ error: "machine vps is unreachable" }, 0), "");
  assert.equal(footerText(undefined, 0), "");
});
test("emptyText", () => {
  assert.equal(emptyText(null), "No skills on this computer yet");
  assert.equal(emptyText("vps"), "No skills on vps yet");
});
test("noticeShown keeps a done notice 4 s and others 8 s", () => {
  assert.equal(noticeShown({ kind: "done", text: "Added", at: 0 }, 3999), true);
  assert.equal(noticeShown({ kind: "done", text: "Added", at: 0 }, 4000), false);
  assert.equal(noticeShown({ kind: "warn", text: "Busy", at: 0 }, 7999), true);
  assert.equal(noticeShown({ kind: "error", text: "Failed", at: 0 }, 8000), false);
  assert.equal(noticeShown(null, 0), false);
  assert.equal(noticeShown({ kind: "done", text: "", at: 0 }, 1), false);
  assert.equal(noticeShown({ kind: "done", text: "x" }, 1), false);
});
test("shortPath", () => assert.equal(shortPath("/Users/a/.agents/skills/pdf", "/Users/a"), "~/.agents/skills/pdf"));
test("shortPath leaves other paths alone", () => {
  assert.equal(shortPath("/Users/a", "/Users/a"), "~");
  assert.equal(shortPath("/Users/ab/x", "/Users/a"), "/Users/ab/x");
  assert.equal(shortPath("/opt/skills/x", "/Users/a"), "/opt/skills/x");
  assert.equal(shortPath("/x/y", ""), "/x/y");
  assert.equal(shortPath("/Users/a/x", "/Users/a/"), "~/x");
});
test("ago", () => {
  assert.equal(ago(2000), "just now");
  assert.equal(ago(9999), "just now");
  assert.equal(ago(12000), "10s ago");
  assert.equal(ago(59000), "50s ago");
  assert.equal(ago(60000), "1m ago");
  assert.equal(ago(180000), "3m ago");
  assert.equal(ago(7200000), "2h ago");
});
test("ago at the edges", () => {
  assert.equal(ago(-500), "just now");
  assert.equal(ago(10000), "10s ago");
  assert.equal(ago(19999), "10s ago");
  assert.equal(ago(20000), "20s ago");
  assert.equal(ago(59999), "50s ago");
});
test("clockRegions is what the clock alone changes on screen", () => {
  const state = { scan: { tools: [{ name: "cursor" }] }, skills: [sk("a", "tool", ["cursor"])], at: 0 };
  const notice = { kind: "done", text: "Added", at: 0 };
  assert.deepEqual(clockRegions(state, null, notice, 3000), {
    footer: "1 skill · 1 tool · checked just now",
    status: { kind: "done", text: "Added" },
  });
  assert.deepEqual(clockRegions(state, null, notice, 12000), { footer: "1 skill · 1 tool · checked 10s ago", status: null });
  // Work in progress hides the notice, so the notice is not what is drawn.
  assert.deepEqual(clockRegions(state, "Adding…", notice, 3000).status, { kind: "busy", text: "Adding…" });
  assert.deepEqual(clockRegions(undefined, null, null, 0), { footer: "", status: null });
});
test("regionsChanged redraws only when a clock-driven text changes", () => {
  const state = { scan: { tools: [{ name: "cursor" }] }, skills: [sk("a", "tool", ["cursor"])], at: 0 };
  const at = (now, notice = null, busy = null) => clockRegions(state, busy, notice, now);
  assert.equal(regionsChanged(null, at(0)), true); // nothing drawn yet
  assert.equal(regionsChanged(at(1000), at(9000)), false); // still "just now"
  assert.equal(regionsChanged(at(9000), at(10000)), true); // "10s ago"
  assert.equal(regionsChanged(at(12000), at(19000)), false);
  assert.equal(regionsChanged(at(19000), at(20000)), true);
  const done = { kind: "done", text: "Added", at: 21000 };
  assert.equal(regionsChanged(at(21000), at(21000, done)), true); // a notice appears
  assert.equal(regionsChanged(at(22000, done), at(24000, done)), false); // the same notice, same footer
  assert.equal(regionsChanged(at(24000, done), at(25000, done)), true); // it runs out after 4 s
  // A notice hidden behind work in progress runs out without a redraw.
  assert.equal(regionsChanged(at(24000, done, "Adding…"), at(25000, done, "Adding…")), false);
  // A busy text that changes (a stale lock dropping) does redraw.
  assert.equal(regionsChanged(at(22000, null, "Adding…"), at(22000)), true);
  assert.equal(regionsChanged(at(22000, { kind: "warn", text: "Added", at: 21000 }), at(22000, done)), true);
});

// ---- The skill dialog ----

test("machineInSentence and cantCheckText", () => {
  assert.equal(machineInSentence(null), "this computer");
  assert.equal(machineInSentence("vps"), "vps");
  assert.equal(cantCheckText(null, "sh: timeout"), "Can't check this computer: sh: timeout");
  assert.equal(cantCheckText("vps", "machine vps is unreachable"), "Can't check vps: machine vps is unreachable");
});

// A scan as parseScan makes it, in registry order.
const dialogScan = {
  home: "/h",
  git: true,
  tools: [
    { name: "claude-code", dir: "/h/.claude/skills", detected: true },
    { name: "cursor", dir: "/h/.cursor/skills", detected: true },
    { name: "windsurf", dir: "/h/.windsurf/skills", detected: true },
    { name: "codex-cli", dir: "/h/.codex/skills", detected: false },
    { name: "amp", dir: "/h/.amp/skills", detected: false },
    { name: "universal", dir: "/h/.agents/skills", detected: true },
  ],
  entries: [],
};
const row = (name, label, shortCode, program, on, control) => ({ name, label, shortCode, program, on, control });

test("toolRows lists detected tools and tools that have the skill, in registry order", () => {
  const alpha = sk("alpha", "store", ["claude-code", "codex-cli", "universal"], { real: "/h/.agents/skills/alpha" });
  assert.deepEqual(toolRows(dialogScan, alpha), [
    row("claude-code", "Claude Code", "CC", "claude", true, "switch"),
    row("cursor", "Cursor", "CU", "cursor", false, "switch"),
    row("windsurf", "Windsurf", "WS", null, false, "switch"),
    row("codex-cli", "Codex CLI", "CX", "codex", true, "switch"), // not detected, but it has the skill
    row("universal", "Universal", "UA", null, true, "shared"),
  ]);
});
test("toolRows gives a skill outside the shared store no switches", () => {
  const solo = sk("solo", "tool", ["claude-code"], { real: "/h/.claude/skills/solo" });
  assert.deepEqual(toolRows(dialogScan, solo), [
    row("claude-code", "Claude Code", "CC", "claude", true, "none"),
    row("cursor", "Cursor", "CU", "cursor", false, "none"),
    row("windsurf", "Windsurf", "WS", null, false, "none"),
    row("universal", "Universal", "UA", null, false, "none"),
  ]);
  const outside = sk("outside", "external", ["cursor"], { real: "/h/ext/outside" });
  assert.deepEqual(toolRows(dialogScan, outside).map((r) => [r.name, r.on, r.control]), [
    ["claude-code", false, "none"],
    ["cursor", true, "none"],
    ["windsurf", false, "none"],
    ["universal", false, "none"],
  ]);
  // A skill in a grouping folder of the store is not the store's shared copy.
  const nested = sk("nested", "tool", ["universal"], { real: "/h/.agents/skills/group/nested" });
  assert.deepEqual(toolRows(dialogScan, nested).at(-1), row("universal", "Universal", "UA", null, true, "none"));
});
test("toolRows shows a switch the dialog is waiting on in its wanted position", () => {
  const alpha = sk("alpha", "store", ["claude-code", "universal"], { real: "/h/.agents/skills/alpha" });
  const on = (rows) => rows.map((r) => [r.name, r.on]);
  assert.deepEqual(on(toolRows(dialogScan, alpha, { tool: "cursor", on: true })), [
    ["claude-code", true],
    ["cursor", true],
    ["windsurf", false],
    ["universal", true],
  ]);
  assert.deepEqual(on(toolRows(dialogScan, alpha, { tool: "claude-code", on: false })).slice(0, 2), [
    ["claude-code", false],
    ["cursor", false],
  ]);
  // A remove request has no tool; nothing changes.
  assert.deepEqual(toolRows(dialogScan, alpha, {}), toolRows(dialogScan, alpha));
  assert.deepEqual(toolRows(dialogScan, alpha, null), toolRows(dialogScan, alpha));
});
test("toolRows with no scan is empty", () => {
  assert.deepEqual(toolRows(null, sk("a", "store", ["universal"])), []);
  assert.deepEqual(toolRows({ tools: [] }, sk("a", "store", ["universal"])), []);
});

test("toolsNote says why a skill outside the shared store has no switches", () => {
  const store = "Only skills in the shared store can be added to other tools.";
  assert.equal(toolsNote(dialogScan, sk("alpha", "store", ["universal"], { real: "/h/.agents/skills/alpha" })), null);
  assert.equal(
    toolsNote(dialogScan, sk("solo", "tool", ["claude-code"], { real: "/h/.claude/skills/solo" })),
    `${store} This one lives in Claude Code's own skills folder.`,
  );
  assert.equal(
    toolsNote(dialogScan, sk("outside", "external", ["cursor"], { real: "/h/ext/outside" })),
    `${store} This one is linked from ~/ext/outside, outside every skills folder.`,
  );
  assert.equal(
    toolsNote(dialogScan, sk("far", "external", ["cursor"], { real: "/opt/skills/far" })),
    `${store} This one is linked from /opt/skills/far, outside every skills folder.`,
  );
  // The holding folder is the longest tool folder around it.
  const scan = { ...dialogScan, tools: [...dialogScan.tools, { name: "zed", dir: "/h/.claude/skills/zed-inside", detected: true }] };
  assert.equal(
    toolsNote(scan, sk("deep", "tool", ["zed"], { real: "/h/.claude/skills/zed-inside/deep" })),
    `${store} This one lives in Zed's own skills folder.`,
  );
  // No tool folder holds it any more (the scan changed): a plain sentence.
  assert.equal(
    toolsNote(dialogScan, sk("lost", "tool", ["claude-code"], { real: "/elsewhere/lost" })),
    `${store} This one lives in a tool's own skills folder.`,
  );
});

test("toolMark finds Herdr's program for a tool, or null for the two-letter badge", () => {
  const programs = [
    { key: "claude", icon: "icons/claude.svg", tint: true },
    { key: "cursor", icon: "icons/cursor.svg", tint: false },
    { key: "codex", icon: null, tint: true },
  ];
  assert.deepEqual(toolMark(programs, "claude"), { icon: "icons/claude.svg", tint: true });
  assert.deepEqual(toolMark(programs, "cursor"), { icon: "icons/cursor.svg", tint: false });
  assert.equal(toolMark(programs, "codex"), null, "no icon");
  assert.equal(toolMark(programs, "amp"), null, "not in the list");
  assert.equal(toolMark(programs, null), null, "a tool with no program");
  assert.equal(toolMark(null, "claude"), null, "still loading, or the check failed");
  assert.equal(toolMark([null, { key: "claude" }], "claude"), null);
});

test("deleteLabel for each state", () => {
  assert.equal(deleteLabel(sk("a", "store", ["universal"]), false), "Delete skill");
  assert.equal(deleteLabel(sk("b", "tool", ["claude-code"]), false), "Delete skill");
  assert.equal(deleteLabel(sk("c", "external", ["cursor"]), false), "Remove from all tools");
  assert.equal(deleteLabel(sk("a", "store", ["universal"]), true), "Click again to delete");
  assert.equal(deleteLabel(sk("c", "external", ["cursor"]), true), "Click again to delete");
});

test("requestPending: a sent request waits until the dialog has read its outcome", () => {
  const sent = { tool: "cursor", on: true, rev: 4, at: 1000 };
  const at = (over) => ({ rev: 4, readRev: 4, notice: null, busy: false, now: 1500, ...over });
  assert.equal(requestPending(null, at({})), false);
  assert.equal(requestPending(sent, at({})), true, "just sent");
  assert.equal(requestPending(sent, at({ busy: true })), true, "running");
  assert.equal(requestPending(sent, at({ rev: 5 })), true, "done, but the dialog has not read again");
  assert.equal(requestPending(sent, at({ rev: 5, notice: { kind: "done", text: "Added", at: 1200 } })), true);
  assert.equal(requestPending(sent, at({ rev: 5, readRev: 5 })), false, "read again after the change");
  // Answered without a change (refused as busy, or the machine can't be read).
  assert.equal(requestPending(sent, at({ notice: { kind: "warn", text: "busy", at: 1000 } })), false);
  assert.equal(requestPending(sent, at({ notice: { kind: "warn", text: "older", at: 999 } })), true);
  assert.equal(requestPending(sent, at({ busy: true, notice: { kind: "done", text: "other machine", at: 1200 } })), true);
  // Nothing came back at all: give up after 150 s, as a stale lock does.
  assert.equal(requestPending(sent, at({ now: 151000 })), true);
  assert.equal(requestPending(sent, at({ now: 151001 })), false);
});

test("stripFrontmatter drops the block and the blank lines after it", () => {
  assert.equal(stripFrontmatter("---\nname: a\ndescription: b\n---\n# Title\nBody\n"), "# Title\nBody\n");
  assert.equal(stripFrontmatter("---\nname: a\n---\n\n\nBody"), "Body");
  assert.equal(stripFrontmatter("---\r\nname: a\r\n---\r\n\r\nBody\r\nmore\r\n"), "Body\nmore\n");
  assert.equal(stripFrontmatter("﻿---\nname: a\n---\nBody"), "Body");
  assert.equal(stripFrontmatter("---  \nname: a\n---   \nBody"), "Body");
  assert.equal(stripFrontmatter("---\nname: a\n---"), "");
});
test("stripFrontmatter leaves text without a closed block alone", () => {
  assert.equal(stripFrontmatter("# Title\n\n---\nnot: frontmatter\n---\n"), "# Title\n\n---\nnot: frontmatter\n---\n");
  assert.equal(stripFrontmatter("---\nname: a\nBody"), "---\nname: a\nBody");
  assert.equal(stripFrontmatter(""), "");
  assert.equal(stripFrontmatter(null), "");
  assert.equal(stripFrontmatter(undefined), "");
});

test("skillDocument: the text without frontmatter, or a short message", () => {
  assert.deepEqual(skillDocument({ text: "---\nname: a\n---\nBody\n" }), { body: "Body\n" });
  assert.deepEqual(skillDocument({ text: "" }), { body: "" });
  assert.deepEqual(skillDocument({ text: null }), { message: "This folder has no SKILL.md." });
  assert.deepEqual(skillDocument({ error: "Permission denied" }), { message: "Couldn't read SKILL.md: Permission denied" });
});

// ---- Discover and the catalog dialog ----

test("formatInstalls", () => {
  assert.equal(formatInstalls(950), "950");
  assert.equal(formatInstalls(229736), "229.7k");
  assert.equal(formatInstalls(1200000), "1.2M");
});
test("formatInstalls at the edges, by hand", () => {
  assert.equal(formatInstalls(0), "0");
  assert.equal(formatInstalls(999), "999");
  assert.equal(formatInstalls(1000), "1k");
  assert.equal(formatInstalls(1049), "1k");
  assert.equal(formatInstalls(1050), "1.1k");
  assert.equal(formatInstalls(999949), "999.9k");
  assert.equal(formatInstalls(999950), "1M", "rounds up into millions, never 1000k");
  assert.equal(formatInstalls(1000000), "1M");
  assert.equal(formatInstalls(12345678), "12.3M");
  assert.equal(formatInstalls(1234.6), "1.2k");
  assert.equal(formatInstalls("1234"), "1.2k");
  assert.equal(formatInstalls(-5), "0");
  assert.equal(formatInstalls(NaN), "0");
  assert.equal(formatInstalls(undefined), "0");
});

// Task 2's fixture home, scanned for real.
async function fixtureScan() {
  const h = makeHome(FIXTURE);
  const r = await createMachine({ exec: h.exec, readText: h.readText }).scan(null);
  assert.equal(r.ok, true);
  return r;
}
test("defaultTargets", async () => {
  const { scan, skills } = await fixtureScan();
  assert.deepEqual(defaultTargets(scan, skills), ["claude-code", "cursor"]);
});
test("defaultTargets leaves out undetected tools and tools without a skill", () => {
  const skills = [sk("alpha", "store", ["claude-code", "codex-cli", "universal"])];
  assert.deepEqual(defaultTargets(dialogScan, skills), ["claude-code"]);
  assert.deepEqual(defaultTargets(dialogScan, []), []);
  assert.deepEqual(defaultTargets(null, null), []);
});
test("installedFolders", async () => {
  const { skills } = await fixtureScan();
  assert.deepEqual(installedFolders(skills), new Set(["alpha", "it's odd name"]));
  assert.deepEqual(installedFolders(null), new Set());
});
test("inStore: the shared store already has the folder an install of this id makes", () => {
  const skills = [sk("pdf", "store", ["universal"]), sk("my-skill", "store", []), sk("solo", "tool", ["claude-code"])];
  assert.equal(inStore(skills, "pdf"), true);
  assert.equal(inStore(skills, "My-Skill"), true, "the folder is sanitizeName(skillId)");
  assert.equal(inStore(skills, "solo"), false, "a folder inside one tool is not the shared copy");
  assert.equal(inStore(skills, "docx"), false);
  assert.equal(inStore(null, "pdf"), false);
  assert.equal(inStore(skills, ""), false);
});

test("searchKey: the trimmed query, or the popular list under two characters", () => {
  assert.equal(searchKey(""), "");
  assert.equal(searchKey(" p "), "");
  assert.equal(searchKey("pd"), "pd");
  assert.equal(searchKey("  pdf  "), "pdf");
  assert.equal(searchKey(null), "");
});
test("discoverView: what the Discover body shows for each state", () => {
  const rows = [{ name: "pdf" }];
  assert.deepEqual(discoverView(null, ""), { body: "searching", label: "POPULAR", message: null });
  assert.deepEqual(discoverView(null, "pdf"), { body: "searching", label: "RESULTS", message: null });
  assert.deepEqual(discoverView({ key: "", results: rows }, ""), { body: "results", label: "POPULAR", message: null });
  assert.deepEqual(discoverView({ key: "pdf", results: rows }, "pdf"), { body: "results", label: "RESULTS", message: null });
  // While a newer search runs, the last outcome stays, under its own label.
  assert.deepEqual(discoverView({ key: "", results: rows }, "pdf"), { body: "results", label: "POPULAR", message: null });
  assert.deepEqual(discoverView({ key: "zzzz", results: [] }, "zzzz"), { body: "empty", label: "RESULTS", message: 'No skills found for "zzzz"' });
  assert.deepEqual(discoverView({ key: "", results: [] }, ""), { body: "empty", label: "POPULAR", message: "No skills found" });
  assert.deepEqual(discoverView({ key: "pdf", error: "skills.sh search failed (HTTP 500)" }, "pdf"), {
    body: "error",
    label: "RESULTS",
    message: "skills.sh search failed (HTTP 500)",
  });
});
test("catalogRows: each row's name, source, installs and tags", () => {
  const results = [
    { id: "anthropics/skills/pdf", source: "anthropics/skills", skillId: "pdf", name: "pdf", installs: 229736, installable: true },
    { id: "a/b/my", source: "a/b", skillId: "My-Skill", name: "My Skill", installs: 950, installable: true },
    { id: "x", source: "bad source", skillId: "pdf", name: "", installs: 0, installable: false },
    { id: "y", source: 7, skillId: null, name: null, installs: 1200000, installable: false },
  ];
  const skills = [sk("pdf", "store", ["universal"]), sk("my-skill", "tool", ["claude-code"])];
  assert.deepEqual(catalogRows(results, skills), [
    { name: "pdf", source: "anthropics/skills", installs: "229.7k", installed: true, installable: true },
    { name: "My Skill", source: "a/b", installs: "950", installed: false, installable: true },
    { name: "pdf", source: "bad source", installs: "0", installed: false, installable: false },
    { name: "Unnamed skill", source: "", installs: "1.2M", installed: false, installable: false },
  ]);
  assert.deepEqual(catalogRows(results, null).map((r) => r.installed), [false, false, false, false], "the machine is not read yet");
  assert.deepEqual(catalogRows(null, skills), []);
});

test("startTargets: the machine's remembered tools, else the default", () => {
  const skills = [sk("alpha", "store", ["claude-code", "universal"])];
  assert.deepEqual(startTargets(undefined, null, dialogScan, skills), ["claude-code"]);
  assert.deepEqual(startTargets({ "": ["cursor"] }, null, dialogScan, skills), ["cursor"]);
  assert.deepEqual(startTargets({ "": [] }, null, dialogScan, skills), [], "an empty choice is a choice");
  assert.deepEqual(startTargets({ vps: ["cursor"] }, null, dialogScan, skills), ["claude-code"], "another machine's choice");
  assert.deepEqual(startTargets({ vps: ["cursor"] }, "vps", dialogScan, skills), ["cursor"]);
  assert.deepEqual(startTargets({ "": "cursor" }, null, dialogScan, skills), ["claude-code"], "not an array");
  assert.deepEqual(startTargets("junk", null, dialogScan, skills), ["claude-code"]);
  assert.deepEqual(startTargets({ "": ["cursor", 7, ""] }, null, dialogScan, skills), ["cursor"]);
});
test("withTargets keeps other machines' choices and never changes the stored object", () => {
  const stored = { vps: ["cursor"] };
  assert.deepEqual(withTargets(stored, null, ["claude-code"]), { vps: ["cursor"], "": ["claude-code"] });
  assert.deepEqual(stored, { vps: ["cursor"] });
  assert.deepEqual(withTargets(undefined, "vps", []), { vps: [] });
  assert.deepEqual(withTargets(["junk"], "vps", ["a"]), { vps: ["a"] });
});
test("checklist lists the detected tools except Universal, checked from the choice", () => {
  // codex-cli is remembered but not detected: it is not listed, so never installed to.
  assert.deepEqual(checklist(dialogScan, ["cursor", "codex-cli"]), [
    { name: "claude-code", label: "Claude Code", shortCode: "CC", program: "claude", checked: false },
    { name: "cursor", label: "Cursor", shortCode: "CU", program: "cursor", checked: true },
    { name: "windsurf", label: "Windsurf", shortCode: "WS", program: null, checked: false },
  ]);
  assert.deepEqual(checklist(dialogScan, new Set(["windsurf"])).map((r) => r.checked), [false, false, true]);
  assert.deepEqual(checklist(null, []), []);
});
test("storeNote names the shared store", () => {
  assert.equal(storeNote(dialogScan), "The shared store (~/.agents/skills) always gets a copy.");
  assert.equal(storeNote(null), "The shared store always gets a copy.");
});
test("installAction: the primary button's label and why it is disabled", () => {
  const row = { source: "anthropics/skills", skillId: "pdf", installable: true };
  const read = { scan: dialogScan, skills: [sk("alpha", "store", ["universal"])] };
  const pdfInStore = [sk("pdf", "store", ["universal"])];
  assert.deepEqual(installAction({ on: null, row, read, busy: null }), { label: "Install on this computer", reason: null, working: false });
  assert.deepEqual(installAction({ on: "vps", row, read: { ...read, skills: pdfInStore }, busy: null }), { label: "Update on vps", reason: null, working: false });
  assert.equal(installAction({ on: null, row, read: { ...read, skills: [sk("pdf", "tool", ["claude-code"])] }, busy: null }).label, "Install on this computer");
  // Disabled, with the reason beside it.
  assert.deepEqual(installAction({ on: null, row, read: {}, busy: null }), { label: "Install on this computer", reason: "Checking this computer…", working: true });
  assert.deepEqual(installAction({ on: "vps", row, read: { error: "machine vps is unreachable" }, busy: null }), {
    label: "Install on vps",
    reason: "Can't check vps: machine vps is unreachable",
    working: false,
  });
  assert.deepEqual(installAction({ on: "vps", row, read: { ...read, scan: { ...dialogScan, git: false } }, busy: null }), {
    label: "Install on vps",
    reason: "git is not installed on vps",
    working: false,
  });
  assert.equal(installAction({ on: null, row, read: { ...read, scan: { ...dialogScan, git: false } }, busy: null }).reason, "git is not installed on this computer");
  assert.deepEqual(installAction({ on: "vps", row, read: { ...read, skills: pdfInStore }, busy: "Installing pdf on vps…" }), {
    label: "Update on vps",
    reason: "Installing pdf on vps…",
    working: true,
  });
  assert.equal(installAction({ on: null, row: { ...row, installable: false }, read, busy: null }).reason, "This skill can't be installed");
});
test("catalogPreview: the description and the body, or Preview unavailable", () => {
  assert.deepEqual(catalogPreview("---\nname: pdf\ndescription: Read PDFs\n---\n# PDF\nBody\n"), { description: "Read PDFs", body: "# PDF\nBody\n" });
  assert.deepEqual(catalogPreview("# Just a body"), { description: "", body: "# Just a body" });
  assert.deepEqual(catalogPreview(""), { description: "", body: "" });
  assert.deepEqual(catalogPreview(null), { message: "Preview unavailable" });
  assert.deepEqual(catalogPreview(undefined), { message: "Preview unavailable" });
});
