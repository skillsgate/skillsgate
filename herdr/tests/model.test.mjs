import test from "node:test";
import assert from "node:assert/strict";
import {
  dropFromLock,
  lockPath,
  machineKey,
  machineLabel,
  mergeLock,
  parseFrontmatter,
  parseScan,
  relativePath,
  sanitizeName,
  toolByName,
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
test("dropFromLock", () => {
  const lock = JSON.stringify({ version: 1, skills: { pdf: {}, docx: {} } });
  assert.deepEqual(Object.keys(JSON.parse(dropFromLock(lock, "pdf").text).skills), ["docx"]);
  assert.deepEqual(dropFromLock(lock, "nope"), { skip: "absent" });
  assert.deepEqual(dropFromLock(null, "pdf"), { skip: "absent" });
  assert.deepEqual(dropFromLock("{nope", "pdf"), { skip: "invalid" });
  assert.deepEqual(dropFromLock('{"version":2,"skills":{"pdf":{}}}', "pdf"), { skip: "invalid" });
});
