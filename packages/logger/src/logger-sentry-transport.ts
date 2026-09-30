import * as Sentry from "@sentry/nextjs";
import { type SeverityLevel } from "@sentry/nextjs";
import { type ILogObj, type Logger } from "tslog";

const loggerLevelToSentryLevel = (level: string): SeverityLevel => {
  switch (level) {
    case "fatal":
    case "error":
      return "error";

    case "warn":
      return "warning";

    case "silly":
    case "debug":
    case "trace":
      return "debug";

    case "info":
      return "info";
  }

  return "debug";
};

const levelToBreadcrumbType = (level: string) => {
  switch (level) {
    case "error":
    case "fatal":
      return "error";

    case "debug":
    case "trace":
    case "silly":
      return "debug";

    case "info":
    default:
      return "default";
  }
};

export const attachLoggerSentryTransport = (logger: Logger<ILogObj>) => {
  logger.attachTransport((log) => {
    const { message, attributes } = log as ILogObj & {
      message: string;
      attributes: Record<string, unknown>;
    };

    if (!message || !attributes) {
      console.error("Logger is not configured properly. Sentry transport will not be attached.");

      return;
    }

    // tslog level names are uppercase ("ERROR"), mappers expect lowercase
    const levelName = log._meta.logLevelName.toLowerCase();
    const level = loggerLevelToSentryLevel(levelName);

    if (level === "error") {
      const error = Object.values(attributes).find((value) => value instanceof Error);
      const captureContext = { level, extra: { message, ...attributes } };

      // Sentry skips Error instances that were already captured, so explicit captureException calls won't duplicate
      if (error) {
        Sentry?.captureException?.(error, captureContext);
      } else {
        Sentry?.captureMessage?.(message, captureContext);
      }
    }

    Sentry?.addBreadcrumb?.({
      message: message,
      type: levelToBreadcrumbType(levelName),
      level,
      // @ts-expect-error - Sentry only allows number type, but ISOString is valid
      timestamp: log._meta.date.toISOString(),
      data: attributes,
    });
  });
};
