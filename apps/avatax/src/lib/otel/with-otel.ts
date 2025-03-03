import { MeterProvider } from "@opentelemetry/sdk-metrics";
import { SpanProcessor } from "@opentelemetry/sdk-trace-node";
import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";

import { BaseError } from "@/error";

import { race } from "./race";

export const withResEnd =
  (onResEnd: () => void) =>
  (handler: NextApiHandler): NextApiHandler => {
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

        const originalResEnd = res.end;

        /**
         * Override native res.end to flush OTEL traces before it ends
         */
        // @ts-expect-error - this is a hack to get around Vercel freezing lambda's
        res.end = async function (this: unknown, ...args: unknown[]) {
          onResEnd();
          // @ts-expect-error passthrough args to the original function
          return originalResEnd.apply(this, args);
        };

        wrappingTarget.apply(thisArg, [req, res]);
      },
    });
  };

export const withOtel = ({
  handler,
  meterProvider,
}: {
  handler: NextApiHandler;
  meterProvider: MeterProvider;
  spanProcessor: SpanProcessor;
}): NextApiHandler => {
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

      const originalResEnd = res.end;

      /**
       * Override native res.end to flush OTEL traces before it ends
       */
      // @ts-expect-error - this is a hack to get around Vercel freezing lambda's
      res.end = async function (this: unknown, ...args: unknown[]) {
        try {
          console.log("Force flush of metrics & traces");
          await race({
            promise: meterProvider.forceFlush(),
            error: new BaseError("Timeout error while flushing metrics"),
            timeout: 1_000,
          });

          await race({
            promise: new Promise(() => {}),
            error: new BaseError("Timeout error while flushing traces"),
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
