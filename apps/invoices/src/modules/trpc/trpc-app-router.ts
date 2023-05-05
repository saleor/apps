import { channelsRouter } from "../channels/channels.router";
import { router } from "./trpc-server";
import { appConfigurationRouter } from "../app-configuration/app-configuration.router";
import { shopInfoRouter } from "../shop-info/shop-info.router";

export const appRouter = router({
  channels: channelsRouter,
  appConfiguration: appConfigurationRouter,
  shopInfo: shopInfoRouter,
});

export type AppRouter = typeof appRouter;
