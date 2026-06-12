import { Queue } from "bullmq";
import { redis } from "./redis";

// IMPORTANT:
// BullMQ should receive Redis connection options, not a live Redis instance.
export const analyticsQueue = new Queue("analytics-queue", {
  connection: redis.options,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
  },
});
