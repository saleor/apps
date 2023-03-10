import { channelsRouter } from "../channels/channels.router";
import { router } from "./trpc-server";
import { providersConfigurationRouter } from "../providers-configuration/providers-configuration.router";
import { channelsConfigurationRouter } from "../channels-configuration/channels-configuration.router";
import { taxjarConfigurationRouter } from "../taxjar/taxjar-configuration.router";
import { avataxConfigurationRouter } from "../avatax/avatax-configuration.router";

export const appRouter = router({
  channels: channelsRouter,
  providersConfiguration: providersConfigurationRouter,
  channelsConfiguration: channelsConfigurationRouter,
  taxJarConfiguration: taxjarConfigurationRouter,
  avataxConfiguration: avataxConfigurationRouter,
});

export type AppRouter = typeof appRouter;
