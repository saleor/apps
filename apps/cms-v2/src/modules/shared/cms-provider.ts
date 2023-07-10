import { Contentful } from "../contentful/contentful";
import { Datocms } from "../datocms/datocms";

export interface CMSProvider {
  type: string;
  displayName: string;
  logoUrl: string;
  description: string;
}

export type CMSType = typeof Contentful.type | typeof Datocms.type;

export const createProvider = (type: CMSType | string): CMSProvider => {
  switch (type) {
    case "contentful": {
      return Contentful;
    }
    case "datocms": {
      return Datocms;
    }
    default: {
      throw new Error("Unknown provider");
    }
  }
};

export const cmsTypes = [Contentful.type, Datocms.type] as const;
