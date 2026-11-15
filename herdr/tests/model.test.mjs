import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  dropFromLock,
  lockPath,
  machineInSentence,
  machineKey,
  machineLabel,
  mergeLock,
  parseFrontmatter,
  parseScan,
  plainName,
  relativePath,
  sanitizeName,
  shortPath,
  stripFrontmatter,
  toolByName,
  toolLabel,
  withoutHerdrPrefix,
} from "../skillsgate/mods/skillsgate/model.js";

test("parseFrontmatter reads name and description", () => {
  assert.deepEqual(parseFrontmatter('---\nname: "pdf"\ndescription: Read PDFs\n---\n', "x"), { name: "pdf", description: "Read PDFs" });
});
test("parseFrontmatter joins a folded description and takes CRLF", () => {
  assert.deepEqual(parseFrontmatter("---\r\nname: a\r\ndescription: >-\r\n  one\r\n  two\r\n---\r\n", "x"), { name: "a", description: "one two" });
});
test("parseFrontmatter caps the name at 200 characters and the description at 1,000", () => {
  const long = "n".repeat(5000);
  const out = parseFrontmatter(`---\nname: ${long}\ndescription: ${"d".repeat(5000)}\n---\n`, "x");
  assert.equal(out.name, "n".repeat(200));
  assert.equal(out.description, "d".repeat(1000));
  // A folded value joined from many lines is capped once joined.
  const folded = parseFrontmatter(`---\nname: a\ndescription: >\n${"  word\n".repeat(400)}---\n`, "x");
  assert.equal(folded.description.length, 1000);
  // Never half of a surrogate pair at the cut.
  assert.equal(parseFrontmatter(`---\nname: ${"a".repeat(199)}😀\n---\n`, "x").name, "a".repeat(199));
  assert.deepEqual(parseFrontmatter("---\nname: short\ndescription: also short\n---\n", "x"), { name: "short", description: "also short" });
});
test("plainName: one plain line of at most 200 characters", () => {
  assert.equal(plainName("  PDF\n\ttools  "), "PDF tools");
  assert.equal(plainName("a\u0000b\u001bc\u007fd\u0085e\u009ff"), "abcdef");
  assert.equal(plainName("one \u0007 two\r\nthree"), "one two three");
  assert.equal(plainName("x".repeat(500)), "x".repeat(200));
  assert.equal(plainName("a ".repeat(150)), "a ".repeat(100).trim());
  assert.equal(plainName(`${"a".repeat(199)}😀z`), "a".repeat(199));
  for (const bad of [null, undefined, 7, {}, ["a"]]) assert.equal(plainName(bad), "", String(bad));
});
test("withoutHerdrPrefix drops the Herdr function's name from an error once", () => {
  assert.equal(withoutHerdrPrefix('`herdr.exec`: unknown machine "vps"'), 'unknown machine "vps"');
  assert.equal(withoutHerdrPrefix("`herdr.readTextFile`: permission denied"), "permission denied");
  assert.equal(withoutHerdrPrefix("sh: 1: awk: not found"), "sh: 1: awk: not found");
  assert.equal(withoutHerdrPrefix("`a`: `b`: c"), "`b`: c");
  assert.equal(withoutHerdrPrefix(undefined), "");
});
test("model.js writes the byte order mark as an escape", () => {
  assert.equal(readFileSync("herdr/skillsgate/mods/skillsgate/model.js", "utf8").includes("\uFEFF"), false);
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
  assert.equal(machineKey("remote-box"), "remote-box");
  assert.equal(machineLabel(null), "This computer");
  assert.equal(machineLabel("remote-box"), "remote-box");
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
test("mergeLock skips a lock of another version with its own reason", () => {
  assert.deepEqual(mergeLock('{"version":2,"skills":{}}', "pdf", "a/b", "t"), { skip: "another version" });
  assert.deepEqual(mergeLock('{"version":3,"skills":[]}', "pdf", "a/b", "t"), { skip: "another version" });
  assert.deepEqual(mergeLock('{"version":0.5}', "pdf", "a/b", "t"), { skip: "another version" });
  // A version that is not a number, or none at all, is not a lock this mod reads.
  assert.deepEqual(mergeLock('{"version":"1","skills":{}}', "pdf", "a/b", "t"), { skip: "invalid" });
  assert.deepEqual(mergeLock('{"skills":{}}', "pdf", "a/b", "t"), { skip: "invalid" });
});
test("mergeLock skips a lock it can't read", () => {
  assert.deepEqual(mergeLock("{nope", "pdf", "a/b", "t"), { skip: "invalid" });
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
  assert.deepEqual(dropFromLock('{"version":2,"skills":{"pdf":{}}}', "pdf"), { skip: "another version" });
});
test("toolLabel drops the folder note and falls back to the name", () => {
  assert.equal(toolLabel("universal"), "Universal");
  assert.equal(toolLabel("claude-code"), "Claude Code");
  assert.equal(toolLabel("no-such-tool"), "no-such-tool");
});
test("shortPath", () => assert.equal(shortPath("/Users/a/.agents/skills/pdf", "/Users/a"), "~/.agents/skills/pdf"));
test("shortPath leaves other paths alone", () => {
  assert.equal(shortPath("/Users/a", "/Users/a"), "~");
  assert.equal(shortPath("/Users/ab/x", "/Users/a"), "/Users/ab/x");
  assert.equal(shortPath("/opt/skills/x", "/Users/a"), "/opt/skills/x");
  assert.equal(shortPath("/x/y", ""), "/x/y");
  assert.equal(shortPath("/Users/a/x", "/Users/a/"), "~/x");
});
test("machineInSentence", () => {
  assert.equal(machineInSentence(null), "this computer");
  assert.equal(machineInSentence("vps"), "vps");
});
test("stripFrontmatter drops the block and the blank lines after it", () => {
  assert.equal(stripFrontmatter("---\nname: a\ndescription: b\n---\n# Title\nBody\n"), "# Title\nBody\n");
  assert.equal(stripFrontmatter("---\nname: a\n---\n\n\nBody"), "Body");
  assert.equal(stripFrontmatter("---\r\nname: a\r\n---\r\n\r\nBody\r\nmore\r\n"), "Body\nmore\n");
  assert.equal(stripFrontmatter("\uFEFF---\nname: a\n---\nBody"), "Body");
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
