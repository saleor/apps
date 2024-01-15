import { ILogObj, Logger } from "tslog";
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
    const { message, attributes, _meta, ...inheritedAttributes } = log as ILogObj & {
      message: string;
      attributes: Record<string, unknown>;
    };

    if (!message || !attributes) {
      console.error("Logger is not configured properly. Sentry transport will not be attached.");

      return;
    }

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
