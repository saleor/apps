import { Contentful } from "../contentful/contentful";

export interface CMSProvider {
  type: string;
  displayName: string;
  logoUrl: string;
  description: string;
}

export const createProvider = (type: typeof Contentful.type | string): CMSProvider => {
  switch (type) {
    case "contentful": {
      return Contentful;
    }
    default: {
      throw new Error("Unknown provider");
    }
  }
};

export type CMSType = typeof Contentful.type;
export const cmsTypes = [Contentful.type] as const;
