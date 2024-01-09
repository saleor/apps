import { createLogger, format, transports } from "winston";
import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions";
import pkg from "../package.json";
import { trace } from "@opentelemetry/api";
import { WinstonOtelTransport } from "@saleor/apps-otel";
import { SentryBreadcrumbTransport } from "@/logger-sentry-transport";

/**
 * Use raw process env, because logger is the root dependency. If there is an error on this layer, logger will fail and logs
 * will be lost.
 */
const useDevFormatting = process.env.CI || process.env.NODE_ENV !== "production";
const otelEnabled = process.env.OTEL_ENABLED === "true";

// todo - remove verbose otel attributes for dev output
const customFormat = format.printf(
  ({ level, message, ...attributes }: { level: string; message: string }) => {
    const simpleMsg = `${message}`;

    let colorizedLevel;

    switch (level) {
      case "debug":
        colorizedLevel = `\x1b[35m${level.toUpperCase()}\x1b[0m`; // Purple
        break;
      case "info":
        colorizedLevel = `\x1b[32m${level.toUpperCase()}\x1b[0m`; // Green
        break;
      case "warn":
        colorizedLevel = `\x1b[33m${level.toUpperCase()}\x1b[0m`; // Yellow
        break;
      case "error":
        colorizedLevel = `\x1b[31m${level.toUpperCase()}\x1b[0m`; // Red
        break;
      default:
        colorizedLevel = level.toUpperCase();
    }

    const prettyAttributes = JSON.stringify(attributes ?? {}, null, 2);

    return `${colorizedLevel} ${simpleMsg}\n${prettyAttributes}`;
  },
);

const devFormat = format.combine(customFormat);
const defaultFormat = format.combine(format.timestamp(), format.json());

export const winstonLogger = createLogger({
  // https://github.com/winstonjs/winston#logging-levels
  level: process.env.APP_LOG_LEVEL,
  format: format.combine({
    transform: (info) => {
      if (!otelEnabled) {
        return info;
        // return { ...(loggerContext.getRawContext() ?? {}), ...info };
      }

      return {
        [SemanticResourceAttributes.SERVICE_NAME]: process.env.OTEL_SERVICE_NAME,
        [SemanticResourceAttributes.SERVICE_VERSION]: pkg.version,
        ["commit-sha"]: process.env.VERCEL_GIT_COMMIT_SHA,
        // [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: env.ENV, // todo
        trace_id: trace.getActiveSpan()?.spanContext().traceId,
        span_id: trace.getActiveSpan()?.spanContext().spanId,
        trace_flags: `0${trace.getActiveSpan()?.spanContext().traceFlags.toString(16) ?? "1"}`,
        // ...(loggerContext.getRawContext() ?? {}),
        ...info,
      };
    },
  }),
});

winstonLogger.add(
  new transports.Console({
    format: useDevFormatting ? devFormat : defaultFormat,
  }),
);

if (otelEnabled) {
  winstonLogger.add(new WinstonOtelTransport());
}

// todo - consider better check for Sentry setup
if (process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN) {
  winstonLogger.add(new SentryBreadcrumbTransport());
}
