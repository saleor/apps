import { channelsRouter } from "../app-configuration/channels/channels.router";
import { router } from "./trpc-server";
import { appConfigurationRouter } from "../app-configuration/app-configuration.router";
import { categoryMappingRouter } from "../category-mapping/category-mapping.router";

export const appRouter = router({
  channels: channelsRouter,
  appConfiguration: appConfigurationRouter,
  categoryMapping: categoryMappingRouter,
});

export type AppRouter = typeof appRouter;
