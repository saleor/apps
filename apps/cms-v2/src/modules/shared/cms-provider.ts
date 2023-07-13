import { ReactElement } from "react";
import { Contentful } from "../providers/contentful/contentful";
import { Datocms } from "../providers/datocms/datocms";
import { Strapi } from "../providers/strapi/strapi";

export interface CMSProvider {
  type: string;
  displayName: string;
  logoUrl: string;
  description: string;
  formSideInfo?: ReactElement;
}

export type CMS = typeof Contentful | typeof Datocms | typeof Strapi;
export type CMSType = typeof Contentful.type | typeof Datocms.type | typeof Strapi.type;

export const createProvider = (type: CMSType | string): CMS => {
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
