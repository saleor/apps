import { channelsRouter } from "../channels/channels.router";
import { router } from "./trpc-server";
import { appConfigurationRouter } from "../app-configuration/app-configuration.router";

export const appRouter = router({
  channels: channelsRouter,
  appConfiguration: appConfigurationRouter,
});

export type AppRouter = typeof appRouter;
