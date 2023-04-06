import { ContentfulIcon, DatocmsIcon, StrapiIcon } from "../../assets";

export const CMS_ID_KEY = "cmsId";

export interface ProviderToken {
  name: string;
  label: string;
  required?: boolean;
}

export interface Provider {
  name: string;
  label: string;
  iconSrc: string;
  tokens: ProviderToken[];
}

export type ProviderMap = Record<string, Provider>;

export const providersMap: ProviderMap = {
  contentful: {
    name: "contentful",
    label: "Contentful",
    iconSrc: ContentfulIcon,
    tokens: [
      { name: "baseUrl", label: "Base URL" },
      { name: "token", label: "Token" },
      { name: "environment", label: "Environment" },
      { name: "spaceId", label: "Space ID" },
      { name: "contentId", label: "Content ID" },
      { name: "locale", label: "Locale" },
    ],
  },
  strapi: {
    name: "strapi",
    label: "Strapi",
    iconSrc: StrapiIcon,
    tokens: [
      { name: "baseUrl", label: "Base Url" },
      { name: "token", label: "Token" },
    ],
  },
  datocms: {
    name: "datocms",
    label: "DatoCMS",
    iconSrc: DatocmsIcon,
    tokens: [
      {
        name: "token",
        label: "API Token (with access to Content Management API)",
        required: true,
      },
      {
        name: "itemTypeId",
        label: "Item Type ID (either number or text)",
        required: true,
      },
      {
        name: "baseUrl",
        label: "Base URL",
      },
      {
        name: "environment",
        label: "Environment",
      },
    ],
  },
};

export const getProviderByName = (name?: keyof ProviderMap): Provider | undefined =>
  name ? providersMap[name] : undefined;
