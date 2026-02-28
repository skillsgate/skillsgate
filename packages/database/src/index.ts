import { createDatabaseClient, type DatabaseClient } from "./client.js";
export { createDatabaseClient, type DatabaseClient };

// Re-export all generated types so consumers can do:
//   import { type User, type Skill, Prisma } from "@skillsgate/database"
export * from "./generated/prisma/client.js";

/**
 * Standardized Cloudflare env shape for apps using Hyperdrive.
 * Both apps/web and apps/api should use binding name "HYPERDRIVE"
 * in their wrangler.jsonc.
 */
export interface CloudflareHyperdriveEnv {
  HYPERDRIVE: { connectionString: string };
}

/**
 * Creates a database client from a Cloudflare Worker env.
 * Use this in any app that has a HYPERDRIVE binding.
 *
 * Usage:
 *   import { getDb } from "@skillsgate/database";
 *   const db = getDb(env);
 */
export function getDb(env: CloudflareHyperdriveEnv): DatabaseClient {
  return createDatabaseClient(env.HYPERDRIVE.connectionString);
}
