import { trace } from "@opentelemetry/api";
import * as Sentry from "@sentry/nextjs";
import { ILogObj, Logger } from "tslog";

import { BaseError, UnknownError } from "./errors";
import { LoggerContext } from "./logger-context";

const VercelMaximumLogSizeExceededError = BaseError.subclass("VercelMaximumLogSizeExceededError");

function isLogExceedingVercelLimit(inputString: string): boolean {
  const byteLength = new TextEncoder().encode(inputString).length;

  return byteLength > 256_000; // Vercel serverless function log limit - 256KB https://vercel.com/docs/observability/runtime-logs#limits
}

export const attachLoggerVercelRuntimeTransport = (
  logger: Logger<ILogObj>,
  appVersion: string,
  loggerContext?: LoggerContext,
) => {
  logger.attachTransport((log) => {
    try {
      const { message, attributes, _meta } = log;

      const bodyMessage = log._meta.name ? `[${log._meta.name}] ${message}` : message;

      const stringifiedMessage = JSON.stringify({
        message: bodyMessage,
        ...(loggerContext?.getRawContext() ?? {}),
        ...attributes,
        deployment: {
          environment: process.env.ENV,
        },
        otel: {
          span_id: trace.getActiveSpan()?.spanContext().spanId,
          trace_id: trace.getActiveSpan()?.spanContext().traceId,
          timestamp: _meta.date.getTime(),
        },
        "commit-sha": process.env.VERCEL_GIT_COMMIT_SHA,
        service: {
          name: process.env.OTEL_SERVICE_NAME,
          version: appVersion,
        },
        _meta: {
          ..._meta,
          // used to filter out log in log drain
          source: "saleor-app",
        },
      });

      if (isLogExceedingVercelLimit(stringifiedMessage)) {
        Sentry.captureException(
          new VercelMaximumLogSizeExceededError("Log message is exceeding Vercel limit", {
            props: {
              logName: log._meta.name,
              logMessage: bodyMessage,
            },
          }),
        );
      }

      // Prints Vercel log in proper level https://vercel.com/docs/observability/runtime-logs#level
      if (_meta.logLevelName === "ERROR") {
        console.error(stringifiedMessage);
        return;
      }

      if (_meta.logLevelName === "WARN") {
        console.warn(stringifiedMessage);
        return;
      }

      console.log(stringifiedMessage);
    } catch (error) {
      Sentry.captureException(
        new UnknownError("Error during attaching Vercel transport", {
          cause: error,
        }),
      );
    }
  });
};
