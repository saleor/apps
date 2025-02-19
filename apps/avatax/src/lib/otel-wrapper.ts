import { trace } from "@opentelemetry/api";
import { type NextApiHandler, NextApiRequest, NextApiResponse } from "next";

import { env } from "@/env";

export const withOtel = (handler: NextApiHandler, staticRouteName: string): NextApiHandler => {
  if (!env.OTEL_ENABLED) {
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

      return trace
        .getTracer("saleor-app-avatax")
        .startActiveSpan(`${staticRouteName}`, async (span) => {
          try {
            wrappingTarget.apply(thisArg, [req, res]);
          } finally {
            span.end();
          }
        });
    },
  });
};
