import test from "node:test";
import assert from "node:assert/strict";
import {
  ago,
  dropFromLock,
  effectiveMachine,
  emptyText,
  filterSkills,
  footerText,
  lockPath,
  machineKey,
  machineLabel,
  machineNames,
  mergeLock,
  noticeShown,
  parseFrontmatter,
  parseScan,
  relativePath,
  sanitizeName,
  sections,
  shortPath,
  summaryText,
  toolByName,
  toolChips,
  toolLabel,
  toolSummary,
} from "../skillsgate/mods/skillsgate/model.js";

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
  assert.equal(footerText({ scan, skills: [sk("a", "tool", ["cursor"])], at: 1000 }, 13000), "1 skill · 1 tool · checked 12s ago");
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
test("ago", () => { assert.equal(ago(2000), "just now"); assert.equal(ago(12000), "12s ago"); assert.equal(ago(180000), "3m ago"); });
test("ago at the edges", () => {
  assert.equal(ago(-500), "just now");
  assert.equal(ago(4999), "just now");
  assert.equal(ago(5000), "5s ago");
  assert.equal(ago(59999), "59s ago");
  assert.equal(ago(60000), "1m ago");
  assert.equal(ago(2 * 3600000 + 5), "2h ago");
});
