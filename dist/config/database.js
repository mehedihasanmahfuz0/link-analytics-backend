"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("../generated/prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg"); // The official Prisma 7 Postgres adapter
const pg_1 = require("pg"); // The standard Node.js Postgres driver
const logger_1 = require("./logger");
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    throw new Error("DATABASE_URL is not defined in your .env file!");
}
// 1. Create a connection pool using the standard 'pg' driver
const pool = new pg_1.Pool({ connectionString });
// 2. Create the Prisma adapter using that pool
const adapter = new adapter_pg_1.PrismaPg(pool);
// 3. Singleton pattern (prevents exhausting DB connections on hot-reloads)
const globalForPrisma = global;
exports.prisma = globalForPrisma.prisma ||
    new client_1.PrismaClient({
        adapter, // 4. Pass the adapter to PrismaClient!
        log: process.env.NODE_ENV === "development"
            ? ["query", "error", "warn"]
            : ["error"],
    });
if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = exports.prisma;
}
logger_1.logger.info("[DB] Prisma Client initialized with pg driver adapter.");
