"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redis = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const logger_1 = require("./logger");
// Singleton pattern for Redis connection
const globalForRedis = global;
exports.redis = globalForRedis.redis ||
    new ioredis_1.default(process.env.REDIS_URL || "redis://localhost:6379", {
        maxRetriesPerRequest: null, // REQUIRED for BullMQ
    });
if (process.env.NODE_ENV !== "production") {
    globalForRedis.redis = exports.redis;
}
// Logging
exports.redis.on("connect", () => logger_1.logger.info("[REDIS] Connected successfully"));
exports.redis.on("error", (err) => logger_1.logger.error({ err }, "[REDIS] Connection error"));
