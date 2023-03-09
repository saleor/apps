import { z } from "zod";
import { ChannelFragment } from "../../../generated/graphql";
import { ContentfulIcon, DatocmsIcon, StrapiIcon } from "../../assets";
import { CreateProviderConfig } from "./types";

export const CMS_ID_KEY = "cmsId";

// todo: use types
// todo: add satisfies
export const providersConfig = {
  contentful: {
    name: "contentful",
    label: "Contentful",
    icon: ContentfulIcon,
    tokens: [
      {
        name: "baseUrl",
        label: "Base URL",
        helpText: "CDN API URL of your Contentful project, e.g. https://cdn.contentful.com.",
      },
      {
        name: "token",
        label: "Token",
        helpText:
          "You can find this in your Contentful project, go to Settings > API keys > Content management tokens > Generate personal token.",
      },
      {
        name: "environment",
        label: "Environment",
        helpText:
          "Environment of your content, e.g. master. You can find this in your Contentful project, go to Settings > Environments.",
      },
      {
        name: "spaceId",
        label: "Space ID",
        helpText:
          "You can find this in your Contentful project, go to settings > general settings.",
      },
      {
        name: "contentId",
        label: "Content ID",
        helpText:
          "You can find this in your Contentful project, go to Content model > select model > Content type id.",
      },
      {
        name: "locale",
        label: "Locale",
        helpText:
          "Locale of your content, e.g. en-US. You can find this in your Contentful project, go to Settings > Locales.",
      },
    ],
  },
  strapi: {
    name: "strapi",
    label: "Strapi",
    icon: StrapiIcon,
    tokens: [
      {
        required: true,
        name: "baseUrl",
        label: "Base URL",
        helpText: "API URL of your Strapi project.",
      },
      {
        required: true,
        name: "token",
        label: "API Token (with full access)",
        helpText:
          "You can find this in your Strapi project settings, go to Settings > API Tokens and use full access token or create new one.",
      },
    ],
  },
  datocms: {
    name: "datocms",
    label: "DatoCMS",
    icon: DatocmsIcon,
    tokens: [
      {
        required: true,
        name: "token",
        label: "API Token (with access to Content Management API)",
        helpText: "You can find this in your DatoCMS project settings.",
      },
      {
        required: true,
        name: "itemTypeId",
        label: "Item Type ID (number)",
        helpText:
          'You can find this as Model ID in your DatoCMS product variant model settings, by clicking "Edit model".',
      },
      {
        name: "baseUrl",
        label: "Base URL",
        helpText:
          "Optional URL to your DatoCMS project. If you leave this blank, this URL will be inferred from your API Token.",
      },
      {
        name: "environment",
        label: "Environment",
        helpText:
          "Optional environment name. If you leave this blank, default environment will be used. You can find this in your DatoCMS project settings.",
      },
    ],
  },
} as const;

export type StrapiConfig = CreateProviderConfig<"strapi">;
export type ContentfulConfig = CreateProviderConfig<"contentful">;
export type DatocmsConfig = CreateProviderConfig<"datocms">;

export const channelsConfigSchema = z.object({
  enabledInChannels: z.array(z.string()),
});

export const strapiConfigSchema = z.object({
  name: z.string().min(1),
  token: z.string().min(1),
  baseUrl: z.string().min(1),
  // enabled: z.boolean(), // @deprecated
  // enabledInChannels: z.array(z.string()),
});

export const contentfulConfigSchema = z.object({
  name: z.string().min(1),
  token: z.string(),
  baseUrl: z.string(),
  environment: z.string(),
  spaceId: z.string(),
  locale: z.string(),
  contentId: z.string(),
  // enabled: z.boolean(), // @deprecated
  // enabledInChannels: z.array(z.string()),
});

export const datocmsConfigSchema = z.object({
  name: z.string().min(1),
  token: z.string().min(1),
  baseUrl: z.string(),
  environment: z.string(),
  itemTypeId: z.string().min(1),
  // enabled: z.boolean(), // @deprecated
  // enabledInChannels: z.array(z.string()),
});

export const providerCommonSchema = z.object({
  id: z.string(),
  providerName: z.string(),
});

export type ProviderCommonSchema = z.infer<typeof providerCommonSchema>;

export const channelCommonSchema = z.object({
  channelSlug: z.string(),
});

export type ChannelCommonSchema = z.infer<typeof channelCommonSchema>;

// todo: helper function so you dont have to merge manually
export const providersSchemaSet = {
  strapi: strapiConfigSchema.merge(providerCommonSchema),
  contentful: contentfulConfigSchema.merge(providerCommonSchema),
  datocms: datocmsConfigSchema.merge(providerCommonSchema),
};

export type CMSProviderSchema = keyof typeof providersSchemaSet;

export const providersSchema = z.object(providersSchemaSet);

export type ProvidersSchema = z.infer<typeof providersSchema>;

export type SingleProviderSchema = ProvidersSchema[keyof ProvidersSchema] & ProviderCommonSchema;

export const providerInstanceSchema = z.union([
  strapiConfigSchema.merge(providerCommonSchema),
  contentfulConfigSchema.merge(providerCommonSchema),
  datocmsConfigSchema.merge(providerCommonSchema),
]);

export type ProviderInstanceSchema = z.infer<typeof providerInstanceSchema>;

export const channelSchema = z
  .object({
    enabledProviderInstances: z.array(z.string()),
  })
  .merge(channelCommonSchema);

export type ChannelSchema = z.infer<typeof channelSchema>;

export type SingleChannelSchema = ChannelSchema & ChannelCommonSchema;

export type MergedChannelSchema = SingleChannelSchema & {
  channel: ChannelFragment;
};

export type CMSChannelSchema = keyof ChannelSchema;

export const cmsSchemaProviderInstances = z.record(z.string(), providerInstanceSchema);
export const cmsSchemaChannels = z.record(z.string(), channelSchema);
export const cmsSchema = z.object({
  providerInstances: cmsSchemaProviderInstances,
  channels: cmsSchemaChannels,
});

export type CMSSchemaProviderInstances = z.infer<typeof cmsSchemaProviderInstances>;
export type CMSSchemaChannels = z.infer<typeof cmsSchemaChannels>;
export type CMSSchema = z.infer<typeof cmsSchema>;
