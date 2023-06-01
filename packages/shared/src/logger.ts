import pino from "pino";

const forbiddenProductionLevels = ["debug", "trace"];

const logLevel = process.env.APP_LOG_LEVEL ?? "silent";

if (process.env.NODE_ENV === "production" && forbiddenProductionLevels.includes(logLevel)) {
  throw new Error(
    `Production app can only log INFO or higher log level. "${logLevel}" is development only.`
  );
  process.exit(1);
}

/**
 * TODO Set up log drain etc
 */
export const logger = pino({
  level: logLevel,
  redact: ["token", "apiKey"],
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

export type Logger = typeof logger;
