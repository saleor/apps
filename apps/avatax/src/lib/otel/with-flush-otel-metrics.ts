import { NextAppRouterHandler } from "@saleor/app-sdk/handlers/next-app-router";
import { race } from "@saleor/apps-shared";
import { after, NextRequest } from "next/server";

import { env } from "@/env";
import { BaseError } from "@/error";
import { createLogger } from "@/logger";

import { meterProvider } from "./meter-provider";

const logger = createLogger("otelMetrics");
const MetricsTimeoutFlushError = BaseError.subclass("MetricsTimeoutFlushError");

export const withFlushOtelMetrics = (handler: NextAppRouterHandler) => {
  return (req: NextRequest) => {
    after(async () => {
      try {
        await race({
          promise: meterProvider.forceFlush(),
          timeoutMilis: env.OTEL_METRICS_FLUSH_TIMEOUT_MILIS,
          error: new MetricsTimeoutFlushError(
            `Metrics did not flush in (${env.OTEL_METRICS_FLUSH_TIMEOUT_MILIS} ms) time`,
          ),
        });
      } catch (error) {
        logger.error("Error while flushing metrics", { error: error });
      }
    });

    return handler(req);
  };
};
