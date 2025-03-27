import {
  Exception,
  Span,
  SpanOptions,
  SpanStatusCode,
  TimeInput,
  trace,
  Tracer,
} from "@opentelemetry/api";
import { ObservabilityAttributes } from "@saleor/apps-otel/src/observability-attributes";

import { BaseError } from "@/error";
import { loggerContext } from "@/logger-context";

import pkg from "../../package.json";

const baseTracer = trace.getTracer("saleor.app.avatax.core", pkg.version);

type CreateSpanCallback = (span: Span) => Promise<unknown> | unknown;

// Create a proxy for Span to intercept recordException
const createSpanProxy = (span: Span): Span => {
  return new Proxy(span, {
    get(target: Span, prop: string) {
      if (prop === "recordException") {
        return (exception: Exception, time?: TimeInput) => {
          if (exception instanceof BaseError) {
            // serialize error to avoid sending stack trace
            return target.recordException(BaseError.serialize(exception), time);
          }
          return target.recordException(exception, time);
        };
      }
      return target[prop as keyof Span];
    },
  });
};

export const appInternalTracer = new Proxy(baseTracer, {
  get(target: Tracer, prop: string) {
    if (prop === "startActiveSpan") {
      return async (name: string, options: SpanOptions, callback: CreateSpanCallback) => {
        return target.startActiveSpan(name, options, async (span) => {
          const proxiedSpan = createSpanProxy(span);

          try {
            // Add default attributes to all spans
            const tenantDomain = loggerContext.getTenantDomain();

            if (tenantDomain) {
              proxiedSpan.setAttribute(ObservabilityAttributes.TENANT_DOMAIN, tenantDomain);
            }

            const result = await callback(proxiedSpan);

            return result;
          } catch (error) {
            proxiedSpan.recordException(error as Error);
            proxiedSpan.setStatus({
              code: SpanStatusCode.ERROR,
              message: (error as Error)?.message,
            });
            throw error;
          } finally {
            proxiedSpan.end();
          }
        });
      };
    }
    return target[prop as keyof Tracer];
  },
});
