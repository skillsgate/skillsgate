import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma-node/client";

export type DatabaseClient = PrismaClient;

/**
 * Creates a PrismaClient for Node.js runtime (local scripts, seeding, CLI tools).
 * The Cloudflare runtime client in ./client.ts uses WASM and won't work in Node.
 */
export function createDatabaseClient(connectionString: string): DatabaseClient {
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}
