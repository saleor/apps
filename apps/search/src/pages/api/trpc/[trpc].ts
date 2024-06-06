import * as trpcNext from "@trpc/server/adapters/next";
import { createTrpcContext } from "../../../modules/trpc/trpc-context";
import { appRouter } from "../../../modules/trpc/trpc-app-router";
import { withOtel } from "@saleor/apps-otel";
import { loggerContext } from "../../../lib/logger-context";
import { wrapWithLoggerContext } from "@saleor/apps-logger/node";

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
