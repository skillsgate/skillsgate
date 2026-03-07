import type { DatabaseClient } from "@skillsgate/database";

export interface Bindings {
  HYPERDRIVE: { connectionString: string };
  OPENAI_API_KEY: string;
  OPENROUTER_API_KEY: string;
  GITHUB_APP_ID: string;
  GITHUB_APP_PRIVATE_KEY: string;
  TELEMETRY: AnalyticsEngineDataset;
  R2_SKILLS: R2Bucket;
  VECTORIZE_QUEUE: Queue<VectorizeSkillWorkflowInput>;
  SKILL_VECTORIZATION_WORKFLOW: Workflow;
  INTERNAL_API_KEY: string;
}

export interface Variables {
  db: DatabaseClient;
  userId: string;
  remainingSearches: number;
}

/**
 * Source location - where to read SKILL.md from
 */
export type SkillSource =
  | { type: 'r2'; r2Key: string }
  | { type: 'github'; repo: string; path: string; ref?: string }
  | { type: 'direct'; skillId: string };

/**
 * Required metadata fields for skill vectorization.
 * NOTE: These MUST NOT overlap with extractable SKILL.md fields.
 * SKILL.md frontmatter wins for: name, description, summary, categories, capabilities, keywords
 */
export interface SkillMetadata {
  slug: string;
  visibility: 'public' | 'private' | 'premium';
  publisherId: string;
  orgId?: string;
  sourceType: 'direct' | 'github';
  priceCents?: number;
}

/**
 * Processing options for skill vectorization
 */
export interface VectorizeOptions {
  force?: boolean;
}

/**
 * Input contract for the skill vectorization workflow
 */
export interface VectorizeSkillWorkflowInput {
  /**
   * Canonical source identifier - the unique key for this skill's origin.
   * Format varies by source type:
   * - GitHub: "github:{owner}/{repo}:{path}"
   * - R2: "r2:{r2Key}"
   * - Direct: "direct:{skillId}"
   */
  sourceId: string;

  /**
   * Source location - where to read SKILL.md from
   */
  source: SkillSource;

  /**
   * Required metadata fields
   */
  metadata: SkillMetadata;

  /**
   * Namespace for vector chunks - controls access
   * Examples: "public", "skill_{skillId}", "org_{orgId}", "pub_{publisherId}"
   */
  namespace: string;

  /**
   * Processing options
   */
  options?: VectorizeOptions;
}
