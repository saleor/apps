import { Logger, ISettingsParam, ILogObj } from "tslog";

/*
 * TODO: Add loggerContext
 * TODO: Migrate to shared
 */
export const logger = new Logger<ILogObj>({
  argumentsArrayName: "payload",
  minLevel: parseInt(process.env.NEW_APP_LOG_LEVEL ?? "3", 10),
});

export const createLogger = (name: string, params?: Record<string, unknown>) =>
  logger.getSubLogger(
    {
      name: name,
    },
    params,
  );

if (typeof window === "undefined") {
  require("@/logger-utils/logger-otel-transport").attachLoggerOtelTransport(logger);
  require("@/logger-utils/logger-sentry-transport").attachLoggerSentryTransport(logger);
}
