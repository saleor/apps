import { channelProviderConnectionRouter } from "../channel-provider-connection/config/channel-provider-connection.router";
import { contentfulRouter } from "../contentful/contentful.router";
import { datocmsRouter } from "../datocms/datocms.router";
import { providersListRouter } from "../providers-listing/providers-list.router";
import { router } from "./trpc-server";

export const appRouter = router({
  contentful: contentfulRouter,
  datocms: datocmsRouter,
  providersList: providersListRouter,
  channelsProvidersConnection: channelProviderConnectionRouter,
});

export type AppRouter = typeof appRouter;
