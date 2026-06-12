import "dotenv/config";
import app from "./app";
import { logger } from "./config/logger";
import { analyticsWorker } from "./workers/analyticsWorker"; // Import the worker

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  logger.info(`[SERVER] Running on http://localhost:${PORT}`);
  logger.info(`[ENV] Environment: ${process.env.NODE_ENV}`);
  logger.info(`[WORKER] Analytics worker is now listening for jobs...`);
});

process.on("SIGTERM", async () => {
  logger.info("SIGTERM received. Shutting down gracefully...");

  // 1. Close the worker first so it stops accepting new jobs
  await analyticsWorker.close();
  logger.info("[WORKER] Worker closed.");

  // 2. Then close the HTTP server
  server.close(() => {
    logger.info("[SERVER] Server closed.");
    process.exit(0);
  });
});
