// The public skills.sh catalog: search it, preview a skill's SKILL.md from
// GitHub, and check that a source and a skill id are safe to hand to git and
// to a regular expression. `fetch` is injected, so tests never reach a network.

const SEARCH = "https://skills.sh/api/search";
const RAW = "https://raw.githubusercontent.com";

// Both patterns are anchored at both ends. In a non-multiline regex `$` matches
// only at the very end of the string, so a trailing newline does not pass.
const SOURCE = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;
const SKILL_ID = /^[A-Za-z0-9._-]+$/;

export function validSource(s) {
  return typeof s === "string" && SOURCE.test(s);
}

export function validSkillId(s) {
  return typeof s === "string" && SKILL_ID.test(s);
}

// The API wants at least two characters; anything shorter lists popular skills.
export function searchUrl(query, limit = 30) {
  const trimmed = String(query ?? "").trim();
  const q = trimmed.length < 2 ? "skill" : trimmed;
  return `${SEARCH}?q=${encodeURIComponent(q)}&limit=${limit}`;
}

export function cloneUrl(source) {
  return `https://github.com/${source}.git`;
}

// Repos lay a skill out in a few ways; HEAD resolves the default branch.
export function contentUrls(source, skillId) {
  const base = `${RAW}/${source}/HEAD/`;
  return [
    `${base}skills/${skillId}/SKILL.md`,
    `${base}skills/.curated/${skillId}/SKILL.md`,
    `${base}skills/.experimental/${skillId}/SKILL.md`,
    `${base}${skillId}/SKILL.md`,
    `${base}SKILL.md`,
  ];
}

export function createCatalog({ fetch }) {
  async function search(query) {
    const res = await fetch(searchUrl(query));
    if (!res.ok) throw new Error(`skills.sh search failed (HTTP ${res.status})`);
    const body = await res.json();
    const skills = Array.isArray(body?.skills) ? body.skills : [];
    return skills.map((s) => ({
      id: s.id,
      source: s.source,
      skillId: s.skillId,
      name: s.name,
      installs: Number(s.installs) || 0,
      installable: validSource(s.source) && validSkillId(s.skillId),
    }));
  }

  async function content(source, skillId) {
    if (!validSource(source) || !validSkillId(skillId)) return null;
    for (const url of contentUrls(source, skillId)) {
      try {
        const res = await fetch(url);
        if (res.ok) return await res.text();
      } catch {
        // A failed request means "not here"; try the next layout.
      }
    }
    return null;
  }

  return { search, content };
}
