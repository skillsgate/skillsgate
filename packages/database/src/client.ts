import { PrismaNeonHttp } from "@prisma/adapter-neon";
import { PrismaClient } from "./generated/prisma/client.js";

export type DatabaseClient = PrismaClient;

/**
 * Creates a new PrismaClient configured with the Neon serverless HTTP adapter.
 *
 * Uses PrismaNeonHttp (not PrismaNeon) because Cloudflare Workers don't
 * support TCP/WebSocket connections — HTTP is the only option.
 *
 * Factory pattern (not singleton) because Workers provide the database
 * URL via per-request env bindings.
 */
export function createDatabaseClient(databaseUrl: string): DatabaseClient {
  const adapter = new PrismaNeonHttp(databaseUrl, { fullResults: true });
  return new PrismaClient({ adapter });
}
