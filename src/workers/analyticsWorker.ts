import { Worker, Job } from "bullmq";
import { redis } from "../config/redis";
import { prisma } from "../config/database";
import { logger } from "../config/logger";

// This worker runs independently, listening for jobs in the 'analytics-queue'
export const analyticsWorker = new Worker(
  "analytics-queue",
  async (job: Job) => {
    const { shortCode } = job.data;
    logger.info(
      { shortCode, jobId: job.id },
      "Worker: Processing click analytics",
    );

    try {
      // Increment the click count in the database atomically
      await prisma.link.update({
        where: { shortCode },
        data: {
          clickCount: {
            increment: 1, // Prisma's atomic increment prevents race conditions!
          },
        },
      });

      logger.info({ shortCode }, "Worker: Click recorded successfully");
    } catch (error) {
      logger.error({ err: error, shortCode }, "Worker: Failed to record click");
      throw error; // Throwing tells BullMQ to retry the job
    }
  },
  {
    connection: redis.options,
    concurrency: 5, // Process up to 5 jobs simultaneously
  },
);

analyticsWorker.on("failed", (job, err) => {
  logger.error({ jobId: job?.id, err }, "Worker: Job permanently failed");
});
