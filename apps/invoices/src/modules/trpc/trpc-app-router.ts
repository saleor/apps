import { channelsRouter } from "../channels/channels.router";
import { router } from "./trpc-server";
import { appConfigurationRouterV1 } from "../app-configuration/schema-v1/app-configuration-router.v1";
import { shopInfoRouter } from "../shop-info/shop-info.router";
import { appConfigurationRouterV2 } from "../app-configuration/schema-v2/app-configuration-router.v2";

export const appRouter = router({
  channels: channelsRouter,
  appConfiguration: appConfigurationRouterV1,
  appConfigurationV2: appConfigurationRouterV2,
  shopInfo: shopInfoRouter,
});

export type AppRouter = typeof appRouter;
