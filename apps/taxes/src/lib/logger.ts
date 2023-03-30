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
  redact: [
    "metadata",
    "providerInstance.config.username",
    "providerInstance.config.password",
    "providerInstance.config.apiKey",
  ],
});

export const createLogger = logger.child.bind(logger);
