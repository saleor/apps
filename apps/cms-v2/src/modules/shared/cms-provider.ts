import { Contentful } from "../contentful/contentful";
import { Datocms } from "../datocms/datocms";
import { Strapi } from "../strapi/strapi";

export interface CMSProvider {
  type: string;
  displayName: string;
  logoUrl: string;
  description: string;
}

export type CMSType = typeof Contentful.type | typeof Datocms.type | typeof Strapi.type;

export const createProvider = (type: CMSType | string): CMSProvider => {
  switch (type) {
    case "contentful": {
      return Contentful;
    }
    case "datocms": {
      return Datocms;
    }
    case "strapi": {
      return Strapi;
    }
    default: {
      throw new Error("Unknown provider");
    }
  }
};

export const cmsTypes = [Contentful.type, Datocms.type, Strapi.type] as const;

export const CMSProviders = [Contentful, Datocms, Strapi];
