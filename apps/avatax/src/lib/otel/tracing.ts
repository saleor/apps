import {
  Exception,
  Span,
  SpanOptions,
  SpanStatusCode,
  TimeInput,
  // eslint-disable-next-line @typescript-eslint/no-restricted-imports
  trace,
  Tracer,
} from "@opentelemetry/api";
import { ObservabilityAttributes } from "@saleor/apps-otel/src/observability-attributes";

import { BaseError } from "@/error";
import { loggerContext } from "@/logger-context";

import pkg from "../../../package.json";
import { OtelTenatDomainResolver } from "./otel-tenant-domain-resolver";

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
 * Creates a configured OpenTelemetry tracer with enhanced capabilities.
 *
 * ### Features
 * - Enhanced error serialization
 * - Custom attribute injection
 * - Proper span lifecycle management
 *
 * @param tracerName - Unique identifier for the tracer in OTEL
 * @returns A function that accepts callbacks for span customization
 *
 * @example
 * ```ts
 * const tracer = getAppTracer("my.service")({
 *   setupSpan: (span) => {
 *     span.setAttribute("environment", "production");
 *   }
 * });
 *
 * await tracer.startActiveSpan(
 *   "operation.name",
 *   async (span) => {
 *     // Your code here
 *   }
 * );
 * ```
 */
const getAppTracer = (tracerName: string) => (callbacks: { setupSpan: (span: Span) => void }) =>
  new Proxy(trace.getTracer(tracerName, pkg.version), {
    get(target: Tracer, prop: string) {
      if (prop === "startActiveSpan") {
        return async (
          name: string,
          options: SpanOptions,
          fn: (span: Span) => Promise<unknown> | unknown,
        ) => {
          return target.startActiveSpan(name, options, async (span) => {
            const proxiedSpan = createSpanProxy(span);

            try {
              callbacks.setupSpan(proxiedSpan);

              const result = await fn(proxiedSpan);

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

const tenantDomainResolver = new OtelTenatDomainResolver({ loggerContext });

/**
 * ### ⚠️ Important
 * This tracer sends data to **both** external and internal collectors.
 *
 * ### Features
 * - Automatically adds tenant domain
 * - Handles error serialization
 * - Manages span lifecycle
 */
export const appExternalTracer = getAppTracer("saleor.app.avatax.service")({
  setupSpan: (span) => {
    const tenantDomain = tenantDomainResolver.getDomain();

    span.setAttribute(ObservabilityAttributes.TENANT_DOMAIN, tenantDomain);
  },
});

/**
 * OpenTelemetry tracer configured for internal collection only.
 *
 * ### Features
 * - Adds tenant domain and Saleor API URL
 * - Handles error serialization
 * - Manages span lifecycle
 * - Keeps data within internal systems
 */
export const appInternalTracer = getAppTracer("saleor.app.avatax.core")({
  setupSpan: (span) => {
    const tenantDomain = tenantDomainResolver.getDomain();
    const saleorApiUrl = loggerContext.getSaleorApiUrl();

    span.setAttribute(ObservabilityAttributes.TENANT_DOMAIN, tenantDomain);
    span.setAttribute(ObservabilityAttributes.SALEOR_API_URL, saleorApiUrl);
  },
});
