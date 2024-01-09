import { SpanKind, SpanStatusCode, type Span } from "@opentelemetry/api";
import { SemanticAttributes } from "@opentelemetry/semantic-conventions";
import { type NextApiHandler, type NextApiRequest, type NextApiResponse } from "next";
import { SALEOR_API_URL_HEADER } from "@saleor/app-sdk/const";

import { race } from "./lib/race";
import { getOtelTracer } from "./otel-tracer";
import { otelSdk } from "./instrumentation";
import { loggerProvider, otelLogsProcessor } from "./otel-logs-setup";
import { batchSpanProcessor } from "./otel-traces-setup";
import { sharedOtelConfig } from "./shared-config";

const tracer = getOtelTracer();

function getVercelRequestId(req: NextApiRequest) {
  return (req.headers["x-vercel-proxy-signature-ts"] as string) ?? "";
}

if (process.env.OTEL_ENABLED && process.env.OTEL_SERVICE_NAME) {
  otelSdk.start();
}

const OTEL_FLUSH_TIMEOUT = sharedOtelConfig.flushTimeout;

export const withOtel = (handler: NextApiHandler, staticRouteName: string): NextApiHandler => {
  if (!process.env.OTEL_ENABLED) {
    return handler;
  }

  return new Proxy(handler, {
    apply: async (
      wrappingTarget,
      thisArg,
      args: [NextApiRequest | undefined, NextApiResponse | undefined],
    ) => {
      const [req, res] = args;

      if (!req) {
        // winstonLogger.warn("No request object found, OTEL is not set-up");

        // @ts-expect-error runtime check
        return wrappingTarget.apply(thisArg, args);
      }

      if (!res) {
        // winstonLogger.warn("No response object found, OTEL is not set-up");

        // @ts-expect-error runtime check
        return wrappingTarget.apply(thisArg, args);
      }

      const vercelRequestId = getVercelRequestId(req);
      const reqMethod = (req.method || "GET").toUpperCase();
      const reqId = req.headers["x-vercel-id"] as string | undefined;
      const saleorApiUrl = req.headers[SALEOR_API_URL_HEADER] as string | undefined;

      return tracer.startActiveSpan(
        `${reqMethod} ${staticRouteName}`,
        {
          kind: SpanKind.SERVER,
        },
        async (span) => {
          if (vercelRequestId) {
            span.setAttribute(SemanticAttributes.FAAS_EXECUTION, vercelRequestId);
          }

          if (req.headers["user-agent"]) {
            span.setAttribute(SemanticAttributes.HTTP_USER_AGENT, req.headers["user-agent"]);
          }

          if (req.url) {
            span.setAttribute("url.path", req.url);
          }

          if (req.headers.referer) {
            span.setAttribute(SemanticAttributes.HTTP_TARGET, req.headers.referer);
          }

          if (req.headers.host) {
            span.setAttribute(SemanticAttributes.NET_HOST_NAME, req.headers.host);
          }

          if (saleorApiUrl) {
            span.setAttribute("saleorApiUrl", saleorApiUrl);
          }

          span.setAttribute("requestId", vercelRequestId);
          span.setAttribute(SemanticAttributes.HTTP_METHOD, reqMethod);
          span.setAttribute(SemanticAttributes.HTTP_ROUTE, staticRouteName);
          span.setAttribute(SemanticAttributes.HTTP_TARGET, req.url ?? "");

          if (reqId) {
            span.setAttribute("vercelRequestId", reqId);
          }

          const originalResEnd = res.end;

          // @ts-expect-error - this is a hack to get around Vercel freezing lambda's
          res.end = async function (this: unknown, ...args: unknown[]) {
            span.setAttribute(SemanticAttributes.HTTP_STATUS_CODE, res.statusCode);
            span.end();

            try {
              await race({
                promise: loggerProvider.forceFlush(),
                error: new Error("Timeout flushing OTEL logs"),
                timeout: OTEL_FLUSH_TIMEOUT,
              });

              await race({
                promise: Promise.all([
                  batchSpanProcessor.forceFlush(),
                  otelLogsProcessor.forceFlush(),
                ]),
                error: new Error("Timeout flushing OTEL spans"),
                timeout: OTEL_FLUSH_TIMEOUT,
              });
            } catch (e) {
              // winstonLogger.error("Failed to flush OTEL", { error: e });
              // noop - don't block return even if we loose traces
            }

            // @ts-expect-error passthrough args
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
              await race({
                promise: loggerProvider.forceFlush(),
                error: new Error("Timeout flushing OTEL logs"),
                timeout: OTEL_FLUSH_TIMEOUT,
              });
              await race({
                promise: Promise.all([
                  batchSpanProcessor.forceFlush(),
                  otelLogsProcessor.forceFlush(),
                ]),
                error: new Error("Timeout flushing OTEL spans"),
                timeout: OTEL_FLUSH_TIMEOUT,
              });
            } catch (e) {
              // winstonLogger.error("Failed to flush OTEL", { error: e });
              // noop - don't block return even if we loose traces
            }

            // Rethrow error so that Next.js (and other wrappers like Sentry) can handle it
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

    // if (error instanceof BaseError) {
    //   span.setAttribute("error.stack", error.stack ?? "");
    //   span.setAttribute("error.severity", error.sentrySeverity ?? "");
    //   span.setAttribute("error.errorCode", error.errorCode ?? "");
    // }
  }
}
