import { contentfulProvider } from "./contentful";
import { strapiProvider } from "./strapi";
import { datoCmsProvider } from "./datocms";

export const cmsProviders = {
  contentful: contentfulProvider,
  strapi: strapiProvider,
  datocms: datoCmsProvider,
};

export type CMSProvider = keyof typeof cmsProviders;
