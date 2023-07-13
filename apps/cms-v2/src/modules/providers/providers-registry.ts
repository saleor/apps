import { Contentful } from "./contentful/contentful";
import { Datocms } from "./datocms/datocms";

import { Strapi } from "./strapi/strapi";

export type CMS = typeof Contentful | typeof Datocms | typeof Strapi;
export type CMSType = typeof Contentful.type | typeof Datocms.type | typeof Strapi.type;

export const cmsTypes = [Contentful.type, Datocms.type, Strapi.type] as const;

export const CMSProviders = [Contentful, Datocms, Strapi] as const;
