import { describe, it } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import os from "node:os";
import { sanitizeName, isPathSafe } from "./installer.js";

describe("installer security and utilities", () => {
  it("should sanitize skill names safely", () => {
    assert.equal(sanitizeName("my-skill"), "my-skill");
    assert.equal(sanitizeName("my skill / danger"), "my-skill-danger");
    assert.equal(sanitizeName("../../evil"), "..-..-evil");
  });

  it("should detect path traversal attacks", () => {
    const base = path.join(os.tmpdir(), "test-skills");
    assert.ok(isPathSafe(path.join(base, "valid-skill"), base));
    assert.ok(!isPathSafe(path.join(base, "..", "escaped"), base));
    assert.ok(!isPathSafe("/etc/passwd", base));
  });
});
