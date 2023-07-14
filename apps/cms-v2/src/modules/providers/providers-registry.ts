import { BuilderIo } from "./builder.io/builder-io";
import { Contentful } from "./contentful/contentful";
import { Datocms } from "./datocms/datocms";
import { Strapi } from "./strapi/strapi";

// todo enable builder

export type CMS = typeof Contentful | typeof Datocms | typeof Strapi | typeof BuilderIo;

export type CMSType =
  | typeof Contentful.type
  | typeof Datocms.type
  | typeof Strapi.type
  | typeof BuilderIo.type;

export const cmsTypes = [Contentful.type, Datocms.type, Strapi.type, BuilderIo.type] as const;

// todo move to providers-resolver?
export const CMSProviders = [
  Contentful,
  Datocms,
  Strapi,
  //  BuilderIo
] as const;
