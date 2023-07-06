import { channelProviderConnectionRouter } from "../channel-provider-connection/config/channel-provider-connection.router";
import { contentfulRouter } from "../contentful/contentful.router";
import { providersListRouter } from "../providers-listing/providers-list.router";
import { router } from "./trpc-server";

export const appRouter = router({
  contentful: contentfulRouter,
  providersList: providersListRouter,
  channelsProvidersConnection: channelProviderConnectionRouter,
});

export type AppRouter = typeof appRouter;
