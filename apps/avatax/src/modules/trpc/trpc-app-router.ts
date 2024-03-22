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
});

export type AppRouter = typeof appRouter;
