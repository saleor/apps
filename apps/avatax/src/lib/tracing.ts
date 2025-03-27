/* eslint-disable @typescript-eslint/no-restricted-imports */
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

export const baseTracer = trace.getTracer("saleor.app.avatax.service", pkg.version);

type CreateSpanCallback = (span: Span) => Promise<unknown> | unknown;

/*
 * Proxy `recordException` method on span to serialize error before sending it to the OTEL collector.
 * Serializing error is necessary to avoid sending stack trace to the collector.
 */
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

/**
 * Tracer that sends spans both to external OTEL & Saleor internal OTEL collectors.
 * **Make sure you intend to use this tracer as it will send spans to external OTEL collector.**
 *
 * Proxied version of `@opentelemetry/api` Tracer that adds tenant domain attribute to all spans.
 * It also calls `span.end()` automatically.
 */
export const appExternalTracer = new Proxy(baseTracer, {
  get(target: Tracer, prop: string) {
    if (prop === "startActiveSpan") {
      return async (name: string, options: SpanOptions, callback: CreateSpanCallback) => {
        return target.startActiveSpan(name, options, async (span) => {
          const proxiedSpan = createSpanProxy(span);

          try {
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

/**
 * Tracer that sends spans to Saleor internal OTEL collector.
 */
export const appInternalTracer = trace.getTracer("saleor.app.avatax.core", pkg.version);
