"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const app_1 = __importDefault(require("./app"));
const logger_1 = require("./config/logger");
const analyticsWorker_1 = require("./workers/analyticsWorker"); // Import the worker
const PORT = process.env.PORT || 3000;
const server = app_1.default.listen(PORT, () => {
    logger_1.logger.info(`[SERVER] Running on http://localhost:${PORT}`);
    logger_1.logger.info(`[ENV] Environment: ${process.env.NODE_ENV}`);
    logger_1.logger.info(`[WORKER] Analytics worker is now listening for jobs...`);
});
process.on("SIGTERM", async () => {
    logger_1.logger.info("SIGTERM received. Shutting down gracefully...");
    // 1. Close the worker first so it stops accepting new jobs
    await analyticsWorker_1.analyticsWorker.close();
    logger_1.logger.info("[WORKER] Worker closed.");
    // 2. Then close the HTTP server
    server.close(() => {
        logger_1.logger.info("[SERVER] Server closed.");
        process.exit(0);
    });
});
