"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyticsQueue = void 0;
const bullmq_1 = require("bullmq");
const redis_1 = require("./redis");
// IMPORTANT:
// BullMQ should receive Redis connection options, not a live Redis instance.
exports.analyticsQueue = new bullmq_1.Queue("analytics-queue", {
    connection: redis_1.redis.options,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: "exponential",
            delay: 2000,
        },
    },
});
