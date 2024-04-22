import { Span, SpanStatusCode } from "@opentelemetry/api";
import { otelSdk } from "./instrumentation";
import { race } from "./lib/race";
import { loggerProvider, otelLogsProcessor } from "./otel-logs-setup";
import { getOtelTracer } from "./otel-tracer";
import { batchSpanProcessor } from "./otel-traces-setup";
import { sharedOtelConfig } from "./shared-config";

const tracer = getOtelTracer();

if (process.env.OTEL_ENABLED === "true" && process.env.OTEL_SERVICE_NAME) {
  otelSdk.start();
}

const OTEL_FLUSH_TIMEOUT = sharedOtelConfig.flushTimeout;

const flushOtel = async () => {
  await race({
    promise: loggerProvider.forceFlush(),
    error: new Error("Timeout flushing OTEL logs from provider"),
    timeout: OTEL_FLUSH_TIMEOUT,
  });

  await race({
    promise: Promise.all([batchSpanProcessor.forceFlush(), otelLogsProcessor.forceFlush()]),
    error: new Error("Timeout flushing OTEL items from processors"),
    timeout: OTEL_FLUSH_TIMEOUT,
  });
};

export const otelWebhooksMigrationWrapper = (migrationFunction: () => void) => {
  if (process.env.OTEL_ENABLED !== "true") {
    return migrationFunction();
  }

  return new Proxy(migrationFunction, {
    apply: async (wrappingTarget, thisArg) => {
      return tracer.startActiveSpan("Webhooks Migration", async (span) => {
        try {
          wrappingTarget.apply(thisArg);
          span.end();
        } catch (error) {
          setErrorOnSpan(error, span);
          span.end();
        } finally {
          try {
            await flushOtel();
          } catch (e) {
            console.error("Failed to flush OTEL", { error: e });
            // noop - don't block return even if we loose traces
          }
        }
      });
    },
  });
};

export function setErrorOnSpan(error: unknown, span: Span) {
  span.setStatus({ code: SpanStatusCode.ERROR });

  if (error instanceof Error) {
    span.setAttribute("error.type", error.name);
    span.recordException(error);
  }
}
