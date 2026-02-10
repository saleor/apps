/*
 * This module must only run on the server. It transitively imports AWS SDK, DynamoDB,
 * and other Node.js-only dependencies. If it gets bundled into the client, those imports
 * crash module loading (missing Node APIs), which cascades into unrelated errors like
 * "app bridge used outside AppBridgeProvider".
 *
 * Consumers that only need the AppRouter type (e.g. trpc-client.ts) must use `import type`.
 *
 * Guard must be before imports so it throws before Node.js-only modules fail to load.
 */
if (typeof window !== "undefined") {
  throw new Error(
    "trpc-app-router.ts must not be imported in the browser — use `import type` instead.",
  );
}

/* eslint-disable import/first */
import { appConfigurationRouter } from "../app-configuration/app-configuration.router";
import { channelsRouter } from "../app-configuration/channels/channels.router";
import { categoryMappingRouter } from "../category-mapping/category-mapping.router";
import { router } from "./trpc-server";

export const appRouter = router({
  channels: channelsRouter,
  appConfiguration: appConfigurationRouter,
  categoryMapping: categoryMappingRouter,
});

export type AppRouter = typeof appRouter;
