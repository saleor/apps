import { channelsRouter } from "../channels/channels.router";
import { router } from "./trpc-server";
import { providersConfigurationRouter } from "../providers-configuration/providers-configuration.router";
import { channelsConfigurationRouter } from "../channels-configuration/channels-configuration.router";

export const appRouter = router({
  channels: channelsRouter,
  providersConfiguration: providersConfigurationRouter,
  channelsConfiguration: channelsConfigurationRouter,
});

export type AppRouter = typeof appRouter;
