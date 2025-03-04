import { wrapWithLoggerContext } from "@saleor/apps-logger/node";
import { wrapWithSpanAttributes } from "@saleor/apps-otel/src/with-span-attributes";
import * as trpcNext from "@trpc/server/adapters/next";

import { loggerContext } from "../../../lib/logger-context";
import { appRouter } from "../../../modules/trpc/trpc-app-router";
import { createTrpcContext } from "../../../modules/trpc/trpc-context";

export default wrapWithLoggerContext(
  wrapWithSpanAttributes(
    trpcNext.createNextApiHandler({
      router: appRouter,
      createContext: createTrpcContext,
    }),
  ),
  loggerContext,
);
