import { channelProviderConnectionRouter } from "../channel-provider-connection/channel-provider-connection.router";
import { contentfulRouter } from "../providers/contentful/contentful.router";
import { datocmsRouter } from "../providers/datocms/datocms.router";
import { providersListRouter } from "../providers-listing/providers-list.router";
import { strapiRouter } from "../providers/strapi/strapi.router";
import { router } from "./trpc-server";

export const appRouter = router({
  contentful: contentfulRouter,
  datocms: datocmsRouter,
  providersConfigs: providersListRouter,
  channelsProvidersConnection: channelProviderConnectionRouter,
  strapi: strapiRouter,
});

export type AppRouter = typeof appRouter;
