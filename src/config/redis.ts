import Redis from "ioredis";
import { logger } from "./logger";

// Singleton pattern for Redis connection
const globalForRedis = global as unknown as { redis: Redis | undefined };

export const redis =
  globalForRedis.redis ||
  new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
    maxRetriesPerRequest: null, // REQUIRED for BullMQ
  });

if (process.env.NODE_ENV !== "production") {
  globalForRedis.redis = redis;
}

// Logging
redis.on("connect", () => logger.info("[REDIS] Connected successfully"));

redis.on("error", (err) => logger.error({ err }, "[REDIS] Connection error"));
