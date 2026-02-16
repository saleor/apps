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
import { clientLogsRouter } from "@/modules/client-logs/client-logs.router";

import { avataxConnectionRouter } from "../avatax/avatax-connection.router";
import { avataxTaxCodeMatchesRouter } from "../avatax/tax-code/avatax-tax-code-matches.router";
import { avataxTaxCodesRouter } from "../avatax/tax-code/avatax-tax-codes.router";
import { channelsConfigurationRouter } from "../channel-configuration/channel-configuration.router";
import { providerConnectionsRouter } from "../provider-connections/provider-connections.router";
import { taxClassesRouter } from "../tax-classes/tax-classes.router";
import { router } from "./trpc-server";

export const appRouter = router({
  providersConfiguration: providerConnectionsRouter,
  channelsConfiguration: channelsConfigurationRouter,
  avataxConnection: avataxConnectionRouter,
  taxClasses: taxClassesRouter,
  avataxTaxCodes: avataxTaxCodesRouter,
  avataxMatches: avataxTaxCodeMatchesRouter,
  clientLogs: clientLogsRouter,
});

export type AppRouter = typeof appRouter;
