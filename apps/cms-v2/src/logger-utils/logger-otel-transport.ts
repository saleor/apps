import { ILogObj, Logger } from "tslog";
import { LogAttributeValue, logs } from "@opentelemetry/api-logs";
import { context } from "@opentelemetry/api";
import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions";

export const attachLoggerOtelTransport = (logger: Logger<ILogObj>) => {
  logger.attachTransport((log) => {
    if (!log.payload) {
      console.error("Logger is not configured properly. OTEL transport will not be attached.");

      return;
    }

    // @ts-ignore
    const message = log.payload[0];

    if (!message) {
      console.warn("First argument in logger should be string message. OTEL will skip");

      return;
    }

    // @ts-ignore
    const attributes = (log.payload[1] as Record<string, LogAttributeValue>) ?? {};

    /**
     * Prune empty keys and serialize top-level arrays, because OTEL can't consume them
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
        [SemanticResourceAttributes.SERVICE_VERSION]: require("../../package.json").version,
        ["commit-sha"]: process.env.VERCEL_GIT_COMMIT_SHA,
        [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: process.env.ENV,
      },
    });
  });
};
