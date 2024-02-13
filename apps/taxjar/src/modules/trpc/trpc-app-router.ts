import { channelsConfigurationRouter } from "../channel-configuration/channel-configuration.router";
import { clientLoggerRouter } from "../logs/client-logger.router";
import { providerConnectionsRouter } from "../provider-connections/provider-connections.router";
import { taxClassesRouter } from "../tax-classes/tax-classes.router";
import { taxJarTaxCodeMatchesRouter } from "../taxjar/tax-code/taxjar-tax-code-matches.router";
import { taxJarTaxCodesRouter } from "../taxjar/tax-code/taxjar-tax-codes.router";
import { taxjarConnectionRouter } from "../taxjar/taxjar-connection.router";
import { router } from "./trpc-server";

export const appRouter = router({
  providersConfiguration: providerConnectionsRouter,
  channelsConfiguration: channelsConfigurationRouter,
  taxJarConnection: taxjarConnectionRouter,
  taxClasses: taxClassesRouter,
  taxJarTaxCodes: taxJarTaxCodesRouter,
  taxJarMatches: taxJarTaxCodeMatchesRouter,
  clientLogs: clientLoggerRouter,
});

export type AppRouter = typeof appRouter;
