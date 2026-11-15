import test from "node:test";
import assert from "node:assert/strict";
import { parseFrontmatter, parseScan } from "../skillsgate/mods/skillsgate/model.js";

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
