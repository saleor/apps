import { trace } from "@opentelemetry/api";
import { MeterProvider } from "@opentelemetry/sdk-metrics";
import { SALEOR_API_URL_HEADER, SALEOR_SCHEMA_VERSION } from "@saleor/app-sdk/const";
import { ObservabilityAttributes } from "@saleor/apps-otel/src/observability-attributes";
import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";

import { BaseError } from "@/error";

import { race } from "./race";

export const withOtel = ({
  handler,
  isOtelEnabled,
  meterProvider,
}: {
  handler: NextApiHandler;
  isOtelEnabled: boolean;
  meterProvider: MeterProvider;
}): NextApiHandler => {
  if (!isOtelEnabled) {
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

      const span = trace.getActiveSpan();

      if (span) {
        const saleorApiUrl = req.headers[SALEOR_API_URL_HEADER] as string | undefined;
        const saleorVersion = req.headers[SALEOR_SCHEMA_VERSION] as string | undefined;

        if (saleorApiUrl) {
          span.setAttribute(ObservabilityAttributes.SALEOR_API_URL, saleorApiUrl);
        }

        if (saleorVersion) {
          span.setAttribute(ObservabilityAttributes.SALEOR_VERSION, saleorVersion);
        }
      }

      const originalResEnd = res.end;

      /**
       * Override native res.end to flush OTEL traces before it ends
       */
      // @ts-expect-error - this is a hack to get around Vercel freezing lambda's
      res.end = async function (this: unknown, ...args: unknown[]) {
        try {
          console.log("Force flush of metrics");
          await race({
            promise: meterProvider.forceFlush(),
            error: new BaseError("Timeout error while flushing metrics"),
            timeout: 1_000,
          });
        } catch (e) {
          console.error("Failed to flush OTEL", { error: e });
          // noop - don't block return even if we loose traces
        }

        // @ts-expect-error passthrough args to the original function
        return originalResEnd.apply(this, args);
      };

      wrappingTarget.apply(thisArg, [req, res]);
    },
  });
};
