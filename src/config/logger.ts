import pino from "pino";

// In development, make logs pretty. In production, output raw JSON for machines.
export const logger =
  process.env.NODE_ENV === "production"
    ? pino({ level: "info" })
    : pino({
        transport: {
          target: "pino-pretty",
          options: {
            colorize: true,
          },
        },
        level: "debug",
      });
