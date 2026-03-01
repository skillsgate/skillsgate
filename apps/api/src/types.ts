import type { DatabaseClient } from "@skillsgate/database";

export interface Bindings {
  HYPERDRIVE: { connectionString: string };
  OPENAI_API_KEY: string;
}

export interface Variables {
  db: DatabaseClient;
  userId: string;
  remainingSearches: number;
}
