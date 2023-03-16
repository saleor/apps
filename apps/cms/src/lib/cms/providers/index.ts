import contentful from "./contentful";
import strapi from "./strapi";
import datocms from "./datocms";

const cmsProviders = {
  contentful,
  strapi,
  datocms,
};

export type CMSProvider = keyof typeof cmsProviders;

export default cmsProviders;
