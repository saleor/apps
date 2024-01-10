import { ILogObj, Logger } from "tslog";
import { LogAttributeValue } from "@opentelemetry/api-logs";
import * as Sentry from "@sentry/nextjs";
import { SeverityLevel } from "@sentry/nextjs";

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
    if (!log.payload) {
      console.error("Logger is not configured properly. OTEL transport will not be attached.");

      return;
    }

    // @ts-expect-error - lib is not typed for payload existence, runtime check exists
    const message = log.payload[0];

    if (!message) {
      console.warn("First argument in logger should be string message. OTEL will skip");

      return;
    }

    // @ts-expect-error - lib is not typed for payload existence, runtime check exists
    const attributes = (log.payload[1] as Record<string, LogAttributeValue>) ?? {};

    logger.attachTransport((log) => {
      Sentry?.addBreadcrumb?.({
        message: message,
        type: levelToBreadcrumbType(log._meta.logLevelName),
        level: loggerLevelToSentryLevel(log._meta.logLevelName),
        // @ts-expect-error Invalid type in Sentry SDK
        timestamp: new Date().toDateString(),
        data: attributes,
      });
    });
  });
};
