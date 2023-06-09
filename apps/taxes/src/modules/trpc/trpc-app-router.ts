import { router } from "./trpc-server";
import { providerConnectionsRouter } from "../provider-connections/provider-connections.router";
import { channelsConfigurationRouter } from "../channel-configuration/channel-configuration.router";
import { taxjarConnectionRouter } from "../taxjar/taxjar-connection.router";
import { avataxConnectionRouter } from "../avatax/avatax-connection.router";

export const appRouter = router({
  providersConfiguration: providerConnectionsRouter,
  channelsConfiguration: channelsConfigurationRouter,
  taxJarConnection: taxjarConnectionRouter,
  avataxConnection: avataxConnectionRouter,
});

export type AppRouter = typeof appRouter;
