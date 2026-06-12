import pino from "pino";

// In development, make logs pretty. In production, output raw JSON for machines.
export const logger = pino({
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
    },
  },
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
});
