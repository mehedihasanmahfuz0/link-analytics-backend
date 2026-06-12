"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyticsWorker = void 0;
const bullmq_1 = require("bullmq");
const redis_1 = require("../config/redis");
const database_1 = require("../config/database");
const logger_1 = require("../config/logger");
// This worker runs independently, listening for jobs in the 'analytics-queue'
exports.analyticsWorker = new bullmq_1.Worker("analytics-queue", async (job) => {
    const { shortCode } = job.data;
    logger_1.logger.info({ shortCode, jobId: job.id }, "Worker: Processing click analytics");
    try {
        // Increment the click count in the database atomically
        await database_1.prisma.link.update({
            where: { shortCode },
            data: {
                clickCount: {
                    increment: 1, // Prisma's atomic increment prevents race conditions!
                },
            },
        });
        logger_1.logger.info({ shortCode }, "Worker: Click recorded successfully");
    }
    catch (error) {
        logger_1.logger.error({ err: error, shortCode }, "Worker: Failed to record click");
        throw error; // Throwing tells BullMQ to retry the job
    }
}, {
    connection: redis_1.redis.options,
    concurrency: 5, // Process up to 5 jobs simultaneously
});
exports.analyticsWorker.on("failed", (job, err) => {
    logger_1.logger.error({ jobId: job?.id, err }, "Worker: Job permanently failed");
});
