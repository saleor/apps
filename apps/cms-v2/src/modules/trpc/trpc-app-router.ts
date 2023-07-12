import { channelProviderConnectionRouter } from "../channel-provider-connection/config/channel-provider-connection.router";
import { contentfulRouter } from "../contentful/contentful.router";
import { datocmsRouter } from "../datocms/datocms.router";
import { providersListRouter } from "../providers-listing/providers-list.router";
import { strapiRouter } from "../strapi/strapi.router";
import { router } from "./trpc-server";

export const appRouter = router({
  contentful: contentfulRouter,
  datocms: datocmsRouter,
  providersConfigs: providersListRouter,
  channelsProvidersConnection: channelProviderConnectionRouter,
  strapi: strapiRouter,
});

export type AppRouter = typeof appRouter;
