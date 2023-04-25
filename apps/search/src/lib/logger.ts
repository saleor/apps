import pino from "pino";

export const logger = pino({
  level: "debug",
  redact: ["token", "secretKey"],
  transport:
    process.env.NODE_ENV === "development"
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
          },
        }
      : undefined,
});

export const createLogger = logger.child.bind(logger);
