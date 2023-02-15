import pino from "pino";

export const logger = pino({
  level: process.env.APP_DEBUG ?? "silent",
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
