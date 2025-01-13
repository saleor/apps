import { wrapWithLoggerContext } from "@saleor/apps-logger/node";
import { withOtel } from "@saleor/apps-otel";
import * as trpcNext from "@trpc/server/adapters/next";

import { loggerContext } from "../../../lib/logger-context";
import { appRouter } from "../../../modules/trpc/trpc-app-router";
import { createTrpcContext } from "../../../modules/trpc/trpc-context";

export default wrapWithLoggerContext(
  withOtel(
    trpcNext.createNextApiHandler({
      router: appRouter,
      createContext: createTrpcContext,
    }),
    "api/trpc",
  ),
  loggerContext,
);
