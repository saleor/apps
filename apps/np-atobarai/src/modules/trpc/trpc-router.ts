/*
 * This module must only run on the server. It transitively imports AWS SDK, DynamoDB,
 * and other Node.js-only dependencies. If it gets bundled into the client, those imports
 * crash module loading (missing Node APIs), which cascades into unrelated errors like
 * "app bridge used outside AppBridgeProvider".
 *
 * Consumers that only need the TrpcRouter type (e.g. trpc-client.ts) must use `import type`.
 *
 * Guard must be before imports so it throws before Node.js-only modules fail to load.
 */
if (typeof window !== "undefined") {
  throw new Error(
    "trpc-router.ts must not be imported in the browser — use `import type` instead.",
  );
}

/* eslint-disable import/first */
import { appConfigRouter } from "@/modules/app-config/trpc-handlers/app-config-router";

import { router } from "./trpc-server";

export const trpcRouter = router({
  appConfig: appConfigRouter,
});

export type TrpcRouter = typeof trpcRouter;
