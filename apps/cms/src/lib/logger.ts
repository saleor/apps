import pino from "pino";

/**
 * TODO Set up log drain etc
 */
export const logger = pino({
  level: "debug",
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
