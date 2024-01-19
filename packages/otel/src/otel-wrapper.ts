import { otelSdk } from "./instrumentation";
import { SpanKind, SpanStatusCode, type Span } from "@opentelemetry/api";
import { SemanticAttributes } from "@opentelemetry/semantic-conventions";
import { type NextApiHandler, type NextApiRequest, type NextApiResponse } from "next";
import { SALEOR_API_URL_HEADER } from "@saleor/app-sdk/const";

import { race } from "./lib/race";
import { getOtelTracer } from "./otel-tracer";

import { loggerProvider, otelLogsProcessor } from "./otel-logs-setup";
import { batchSpanProcessor } from "./otel-traces-setup";
import { sharedOtelConfig } from "./shared-config";
import { getAttributesFromRequest } from "./get-attributes-from-request";

const tracer = getOtelTracer();

// eslint-disable-next-line turbo/no-undeclared-env-vars
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

/**
 * TODO: Consider injecting into Next.js config, to automatically wrap routes and infer static route name from file name
 */
export const withOtel = (handler: NextApiHandler, staticRouteName: string): NextApiHandler => {
  // eslint-disable-next-line turbo/no-undeclared-env-vars
  if (process.env.OTEL_ENABLED !== "true") {
    return handler;
  }

  return new Proxy(handler, {
    apply: async (
      wrappingTarget,
      thisArg,
      args: [NextApiRequest | undefined, NextApiResponse | undefined],
    ) => {
      const [req, res] = args;

      if (!req || !res) {
        console.warn("No request and/or response objects found, OTEL is not set-up");

        // @ts-expect-error runtime check
        return wrappingTarget.apply(thisArg, args);
      }

      const attributesFromRequest = getAttributesFromRequest(req);

      return tracer.startActiveSpan(
        `${attributesFromRequest[SemanticAttributes.HTTP_METHOD]} ${staticRouteName}`,
        {
          kind: SpanKind.SERVER,
          attributes: attributesFromRequest,
        },
        async (span) => {
          span.setAttribute(SemanticAttributes.HTTP_ROUTE, staticRouteName);

          const originalResEnd = res.end;

          /**
           * Override native res.end to flush OTEL traces before it ends
           */
          // @ts-expect-error - this is a hack to get around Vercel freezing lambda's
          res.end = async function (this: unknown, ...args: unknown[]) {
            span.setAttribute(SemanticAttributes.HTTP_STATUS_CODE, res.statusCode);
            span.end();

            try {
              await flushOtel();
            } catch (e) {
              console.error("Failed to flush OTEL", { error: e });
              // noop - don't block return even if we loose traces
            }

            // @ts-expect-error passthrough args to the original function
            return originalResEnd.apply(this, args);
          };

          try {
            // return await loggerContext.wrap(() => wrappingTarget.apply(thisArg, [req, res]));

            wrappingTarget.apply(thisArg, [req, res]);
          } catch (error) {
            span.setAttribute(SemanticAttributes.HTTP_STATUS_CODE, 500);

            setErrorOnSpan(error, span);

            span.end();

            try {
              await flushOtel();
            } catch (e) {
              console.error("Failed to flush OTEL", { error: e });
            }

            /**
             * Rethrow error so that Next.js (and other wrappers like Sentry) can handle it
             */
            throw error;
          }
        },
      );
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
