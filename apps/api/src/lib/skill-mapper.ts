import { deriveInstallCommand } from "./install-command";
import { deriveUrlPath } from "./url-path";

// ─── Types ──────────────────────────────────────────────────────────

export interface CatalogSkillRow {
  id: string;
  slug: string;
  name: string;
  description: string;
  summary: string | null;
  categories: unknown;
  capabilities: unknown;
  keywords: unknown;
  github_repo: string | null;
  github_path: string | null;
  source_type: string | null;
  publisher_id: string | null;
  source_id: string | null;
  github_stars: number | null;
}

// ─── Helpers ────────────────────────────────────────────────────────

export function parseJsonArray(value: unknown): string[] {
  if (Array.isArray(value)) return value as string[];
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

export function mapSkill(row: CatalogSkillRow) {
  const githubRepo = row.github_repo ?? "";
  const githubPath = row.github_path ?? "";
  const githubUrl = githubRepo
    ? `https://github.com/${githubRepo}${githubPath ? `/blob/main/${githubPath}` : ""}`
    : "";

  return {
    skillId: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    summary: row.summary ?? "",
    categories: parseJsonArray(row.categories),
    capabilities: parseJsonArray(row.capabilities),
    keywords: parseJsonArray(row.keywords),
    githubUrl,
    githubStars: row.github_stars ?? null,
    installCommand: deriveInstallCommand(
      row.slug,
      row.source_type,
      null,
      githubRepo,
      githubPath
    ),
    urlPath: deriveUrlPath(row.source_id, row.id),
  };
}
