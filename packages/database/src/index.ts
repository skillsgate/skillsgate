export { createDatabaseClient, type DatabaseClient } from "./client.js";

// Re-export all generated types so consumers can do:
//   import { type User, type Skill, Prisma } from "@openskills/database"
export * from "./generated/prisma/client.js";
