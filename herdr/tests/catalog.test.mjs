import test from "node:test";
import assert from "node:assert/strict";
import {
  cloneUrl,
  contentUrls,
  createCatalog,
  searchUrl,
  validSkillId,
  validSource,
} from "../skillsgate/mods/skillsgate/catalog.js";

// A fake fetch that records every URL it is asked for and answers from a queue.
function fakeFetch(...answers) {
  const urls = [];
  const fetch = async (url) => {
    urls.push(url);
    const answer = answers[urls.length - 1];
    if (answer instanceof Error) throw answer;
    return answer;
  };
  return { fetch, urls };
}

test("searchUrl", () => {
  assert.equal(searchUrl("pdf"), "https://skills.sh/api/search?q=pdf&limit=30");
  assert.equal(searchUrl(" a "), "https://skills.sh/api/search?q=skill&limit=30");
  assert.equal(searchUrl("c++ tips"), "https://skills.sh/api/search?q=c%2B%2B%20tips&limit=30");
  assert.equal(searchUrl("pdf", 5), "https://skills.sh/api/search?q=pdf&limit=5");
});

test("cloneUrl", () => {
  assert.equal(cloneUrl("anthropics/skills"), "https://github.com/anthropics/skills.git");
});

test("contentUrls, in order", () => {
  const base = "https://raw.githubusercontent.com/anthropics/skills/HEAD/";
  assert.deepEqual(contentUrls("anthropics/skills", "pdf"), [
    base + "skills/pdf/SKILL.md", base + "skills/.curated/pdf/SKILL.md",
    base + "skills/.experimental/pdf/SKILL.md", base + "pdf/SKILL.md", base + "SKILL.md",
  ]);
});

test("search maps rows", async () => {
  const { fetch, urls } = fakeFetch({
    ok: true,
    json: async () => ({ skills: [
      { id: "anthropics/skills/pdf", source: "anthropics/skills", skillId: "pdf", name: "pdf", installs: 229736 },
      { id: "x", source: "not a repo", skillId: "y", name: "y", installs: 1 }] }),
  });
  const rows = await createCatalog({ fetch }).search("pdf");
  assert.deepEqual(urls, [searchUrl("pdf")]);
  assert.deepEqual(rows.map((r) => r.installable), [true, false]);
  assert.equal(rows[0].installs, 229736);
  assert.deepEqual(rows[0], {
    id: "anthropics/skills/pdf", source: "anthropics/skills", skillId: "pdf",
    name: "pdf", installs: 229736, installable: true,
  });
});

test("search defaults installs to 0 and yields [] without a skills array", async () => {
  const one = fakeFetch({ ok: true, json: async () => ({ skills: [{ id: "a/b/c", source: "a/b", skillId: "c", name: "c" }] }) });
  const rows = await createCatalog({ fetch: one.fetch }).search("c");
  assert.equal(rows[0].installs, 0);
  const none = fakeFetch({ ok: true, json: async () => ({ count: 0 }) });
  assert.deepEqual(await createCatalog({ fetch: none.fetch }).search("zzz"), []);
});

test("search fails with the status", async () => {
  await assert.rejects(createCatalog({ fetch: async () => ({ ok: false, status: 503 }) }).search("pdf"), /skills\.sh search failed \(HTTP 503\)/);
});

test("search passes a network failure through", async () => {
  const boom = new Error("offline");
  await assert.rejects(createCatalog({ fetch: async () => { throw boom; } }).search("pdf"), (err) => err === boom);
});

test("content returns the first file found, null when none, and survives a failed request", async () => {
  const urls = contentUrls("anthropics/skills", "pdf");
  const found = fakeFetch(
    { ok: false, status: 404 },
    new Error("socket hang up"),
    { ok: true, text: async () => "text" },
  );
  assert.equal(await createCatalog({ fetch: found.fetch }).content("anthropics/skills", "pdf"), "text");
  assert.deepEqual(found.urls, urls.slice(0, 3));

  const missing = fakeFetch(...urls.map(() => ({ ok: false, status: 404 })));
  assert.equal(await createCatalog({ fetch: missing.fetch }).content("anthropics/skills", "pdf"), null);
  assert.deepEqual(missing.urls, urls);
});

test("content makes no request for an invalid source or skill id", async () => {
  const { fetch, urls } = fakeFetch({ ok: true, text: async () => "text" });
  const catalog = createCatalog({ fetch });
  assert.equal(await catalog.content("a/b/c", "pdf"), null);
  assert.equal(await catalog.content("anthropics/skills", "a;rm -rf ~"), null);
  assert.equal(await catalog.content("anthropics/skills", "pdf\n"), null);
  assert.deepEqual(urls, []);
});

test("validation", () => {
  assert.equal(validSource("anthropics/skills"), true);
  assert.equal(validSource("a/b/c"), false);
  assert.equal(validSkillId("pdf-tools_2.0"), true);
  assert.equal(validSkillId("a;rm -rf ~"), false);
});

test("validSkillId refuses dot and dash-led names", () => {
  for (const bad of [".", "..", ".hidden", "-x", "_x", "", "a/b", "a b", "a\nb", undefined]) {
    assert.equal(validSkillId(bad), false, JSON.stringify(bad));
  }
  for (const good of ["pdf", "pdf-tools_2.0", "0day"]) {
    assert.equal(validSkillId(good), true, good);
  }
});

test("validSource refuses dot and dash-led segments", () => {
  for (const bad of ["../..", "a/..", "./b", "-a/b", "a/-b", "a/b/c", "a", "", "a/b\n", undefined]) {
    assert.equal(validSource(bad), false, JSON.stringify(bad));
  }
  for (const good of ["anthropics/skills", "a.b/c_d-e"]) {
    assert.equal(validSource(good), true, good);
  }
});

test("content makes no request for dot segments", async () => {
  const { fetch, urls } = fakeFetch({ ok: true, text: async () => "text" });
  const catalog = createCatalog({ fetch });
  assert.equal(await catalog.content("../..", "pdf"), null);
  assert.equal(await catalog.content("anthropics/skills", ".."), null);
  assert.deepEqual(urls, []);
});

test("search marks a dot-dot skill id as not installable", async () => {
  const { fetch } = fakeFetch({
    ok: true,
    json: async () => ({ skills: [{ id: "a/b/..", source: "a/b", skillId: "..", name: "x", installs: 1 }] }),
  });
  const rows = await createCatalog({ fetch }).search("x");
  assert.equal(rows[0].installable, false);
});

test("validators are anchored: newline, space, semicolon and extra segments fail", () => {
  for (const bad of ["a/b\n", "\na/b", "a/b ", "a /b", "a/b;x", "a/b/c", "a", "/b", "a/", "", "a/b\nc/d"]) {
    assert.equal(validSource(bad), false, JSON.stringify(bad));
  }
  for (const bad of ["pdf\n", "\npdf", "pdf x", "a;b", "a/b", "", "$(x)", "a\nb"]) {
    assert.equal(validSkillId(bad), false, JSON.stringify(bad));
  }
  assert.equal(validSource(undefined), false);
  assert.equal(validSkillId(null), false);
  assert.equal(validSkillId(42), false);
});
