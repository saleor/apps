import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import type { NextRequest } from "next/server";

import { createLogger } from "@/lib/logger";
import { createTrpcContextAppRouter } from "@/modules/trpc/context-app-router";
import { appRouter } from "@/modules/trpc/trpc-router";

const logger = createLogger("trpcHandler");

export const config = {
  runtime: "edge",
};

export default async function handler(req: NextRequest) {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: createTrpcContextAppRouter,
    onError({ error }) {
      if (error.code === "INTERNAL_SERVER_ERROR") {
        logger.error("tRPC internal error", { errorMessage: error.message });
      }
    },
  });
}
