import { Logger } from "tslog";
import { LogAttributeValue, logs } from "@opentelemetry/api-logs";
import { context } from "@opentelemetry/api";
import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions";
import * as Sentry from "@sentry/nextjs";
import {SeverityLevel} from "@sentry/nextjs";

// TODO: ADD loggerContext
export const logger = new Logger({
  argumentsArrayName: "payload",
});

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

if (typeof window === "undefined") {
  logger.attachTransport((log) => {
    // @ts-ignore
    const message = log.payload[0] as string;
    // @ts-ignore
    const attributes = (log.payload[1] as Record<string, LogAttributeValue>) ?? {};

    /**
     * Prune empy keys and serialize top-level arrays, because OTEL can't consume them
     */
    const serializedAttributes = Object.entries(attributes).reduce(
      (acc, [key, value]) => {
        /**
         * Prune empty keys, to save bandwidth
         */
        if (!value) {
          return acc;
        }

        if (Array.isArray(value)) {
          acc[key] = JSON.stringify(value);
        } else {
          acc[key] = value;
        }

        return acc;
      },
      {} as Record<string, unknown>,
    );

    logs.getLogger("app-logger-otel").emit({
      body: message,
      context: context.active(),
      severityText: log._meta.logLevelName,
      attributes: {
        ...serializedAttributes,
        [SemanticResourceAttributes.SERVICE_NAME]: process.env.OTEL_SERVICE_NAME,
        [SemanticResourceAttributes.SERVICE_VERSION]: require("../package.json").version,
        ["commit-sha"]: process.env.VERCEL_GIT_COMMIT_SHA,
        [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: process.env.ENV,
      },
    });
  });

  logger.attachTransport((log) => {
    Sentry?.addBreadcrumb?.({
      message: log.payload[0] as string,
      type: "debug", //todo,
      level: loggerLevelToSentryLevel(log._meta.logLevelName),
      // @ts-expect-error Invalid type in Sentry SDK
      timestamp: new Date().toDateString(),
      data: log.payload[1] as Record<string, unknown>,
    });
  });
}
