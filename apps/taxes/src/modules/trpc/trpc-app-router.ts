import { router } from "./trpc-server";
import { providerConnectionsRouter } from "../provider-connections/provider-connections.router";
import { channelsConfigurationRouter } from "../channel-configuration/channel-configuration.router";
import { taxjarConnectionRouter } from "../taxjar/taxjar-connection.router";
import { avataxConnectionRouter } from "../avatax/avatax-connection.router";
import { taxClassesRouter } from "../tax-classes/tax-classes.router";
import { avataxTaxCodesRouter } from "../avatax/tax-code/avatax-tax-codes.router";
import { taxJarTaxCodesRouter } from "../taxjar/tax-code/taxjar-tax-codes.router";
import { taxJarTaxCodeMatchesRouter } from "../taxjar/tax-code/taxjar-tax-code-matches.router";
import { avataxTaxCodeMatchesRouter } from "../avatax/tax-code/avatax-tax-code-matches.router";
import { avataxClientLoggerRouter } from "../avatax/logs/avatax-client-logger.router";
import { taxjarClientLoggerRouter } from "../taxjar/logs/taxjar-client-logger.router";

/*
 * // todo: split to namespaces, e.g.:
 * avatax: { connection, taxCodes, taxCodeMatches }
 */
export const appRouter = router({
  providersConfiguration: providerConnectionsRouter,
  channelsConfiguration: channelsConfigurationRouter,
  taxJarConnection: taxjarConnectionRouter,
  avataxConnection: avataxConnectionRouter,
  taxClasses: taxClassesRouter,
  avataxTaxCodes: avataxTaxCodesRouter,
  taxJarTaxCodes: taxJarTaxCodesRouter,
  taxJarMatches: taxJarTaxCodeMatchesRouter,
  avataxMatches: avataxTaxCodeMatchesRouter,
  avataxClientLogs: avataxClientLoggerRouter,
  taxjarClientLogs: taxjarClientLoggerRouter,
});

export type AppRouter = typeof appRouter;
