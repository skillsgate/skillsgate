import type { DatabaseClient } from "@skillsgate/database";

export interface Bindings {
  HYPERDRIVE: { connectionString: string };
  OPENAI_API_KEY: string;
  GITHUB_APP_ID: string;
  GITHUB_APP_PRIVATE_KEY: string;
  TELEMETRY: AnalyticsEngineDataset;
  R2_SKILLS: R2Bucket;
}

export interface Variables {
  db: DatabaseClient;
  userId: string;
  remainingSearches: number;
}
