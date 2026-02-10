import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client.js";

export type DatabaseClient = PrismaClient;

/**
 * Creates a new PrismaClient configured with the pg driver adapter.
 *
 * In production, pass the Hyperdrive connection string
 * (env.HYPERDRIVE.connectionString) so Cloudflare handles
 * connection pooling at the network level.
 *
 * Factory pattern (not singleton) because Workers provide the database
 * URL via per-request env bindings.
 */
export function createDatabaseClient(connectionString: string): DatabaseClient {
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}
