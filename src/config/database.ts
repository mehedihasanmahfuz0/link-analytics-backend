import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg"; // The official Prisma 7 Postgres adapter
import { Pool } from "pg"; // The standard Node.js Postgres driver
import { logger } from "./logger";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined in your .env file!");
}

// 1. Create a connection pool using the standard 'pg' driver
const pool = new Pool({ connectionString });

// 2. Create the Prisma adapter using that pool
const adapter = new PrismaPg(pool);

// 3. Singleton pattern (prevents exhausting DB connections on hot-reloads)
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter, // 4. Pass the adapter to PrismaClient!
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

logger.info("[DB] Prisma Client initialized with pg driver adapter.");
