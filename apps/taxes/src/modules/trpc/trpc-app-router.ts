import { avataxConnectionRouter } from "../avatax/avatax-connection.router";
import { avataxTaxCodeMatchesRouter } from "../avatax/tax-code/avatax-tax-code-matches.router";
import { avataxTaxCodesRouter } from "../avatax/tax-code/avatax-tax-codes.router";
import { channelsConfigurationRouter } from "../channel-configuration/channel-configuration.router";
import { clientLoggerRouter } from "../logs/client-logger.router";
import { providerConnectionsRouter } from "../provider-connections/provider-connections.router";
import { taxClassesRouter } from "../tax-classes/tax-classes.router";
import { taxJarTaxCodeMatchesRouter } from "../taxjar/tax-code/taxjar-tax-code-matches.router";
import { taxJarTaxCodesRouter } from "../taxjar/tax-code/taxjar-tax-codes.router";
import { taxjarConnectionRouter } from "../taxjar/taxjar-connection.router";
import { router } from "./trpc-server";

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
  clientLogs: clientLoggerRouter,
});

export type AppRouter = typeof appRouter;
