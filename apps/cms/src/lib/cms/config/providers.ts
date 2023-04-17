import { z } from "zod";
import { CreateProviderConfig } from "../types";
import { ContentfulIcon, DatocmsIcon, StrapiIcon } from "../../../assets";

type ProviderToken = {
  name: string;
  label: string;
  helpText: string;
  required?: boolean;
  secret?: boolean;
};

type ProviderConfig = {
  name: string;
  label: string;
  icon: React.ReactNode;
  tokens: ProviderToken[];
};

type ProvidersConfig = Record<string, ProviderConfig>;

export const providersConfig = {
  contentful: {
    name: "contentful",
    label: "Contentful",
    icon: ContentfulIcon,
    tokens: [
      {
        required: true,
        secret: true,
        name: "token",
        label: "Token",
        helpText:
          'You can find this in your Contentful project, go to Settings > API Keys > Content Management Tokens > Generate Personal Token. More instructions at [Contentful "Authentication" documentation](https://www.contentful.com/developers/docs/references/authentication/).',
      },
      {
        required: true,
        name: "environment",
        label: "Environment",
        helpText:
          "Environment of your content, e.g. master. You can find this in your Contentful project, go to Settings > Environments.",
      },
      {
        required: true,
        name: "spaceId",
        label: "Space ID",
        helpText:
          "You can find this in your Contentful project, go to Settings > General Settings.",
      },
      {
        required: true,
        name: "contentId",
        label: "Content ID",
        helpText:
          "You can find this in your Contentful project, go to Content Model > select Model > Content Type ID.",
      },
      {
        required: true,
        name: "locale",
        label: "Locale",
        helpText:
          "Locale of your content, e.g. en-US. You can find this in your Contentful project, go to Settings > Locales.",
      },
      {
        name: "baseUrl",
        label: "Base URL",
        helpText:
          "Content management API URL of your Contentful project. If you leave this blank, default https://api.contentful.com will be used.",
      },
      {
        name: "apiRequestsPerSecond",
        label: "API requests per second",
        helpText:
          "API rate limits. The default is 7. Used in bulk products variants sync. Higher rate limits may speed up a little products variants bulk sync. Higher rate limit may apply depending on different Contentful plan, learn more at https://www.contentful.com/developers/docs/references/content-management-api/#/introduction/api-rate-limits.",
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
        helpText: "API URL of your Strapi project. E.g. https://your-strapi-project/api.",
      },
      {
        required: true,
        secret: true,
        name: "token",
        label: "API Token (with full access)",
        helpText:
          'You can find this in your Strapi project settings, go to Settings > API Tokens and use full access token or create new one. More instructions at [Strapi "Managing API tokens" documentation](https://docs.strapi.io/user-docs/latest/settings/managing-global-settings.html#managing-api-tokens).',
      },
      {
        required: true,
        name: "contentTypeId",
        label: "Content Type ID (plural)",
        helpText:
          'You can find this in your Strapi project, go to Content-Type Builder > select Content Type > click Edit > Use API ID (Plural). More instructions at [Strapi "Editing content types" documentation](https://docs.strapi.io/user-docs/content-type-builder/managing-content-types#editing-content-types).',
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
        secret: true,
        name: "token",
        label: "API Token (with access to Content Management API)",
        helpText:
          'You can find this in your DatoCMS project settings. More instructions at [DatoCMS "Authentication" documentation](https://www.datocms.com/docs/content-management-api/authentication).',
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
          "URL to your DatoCMS project. If you leave this blank, this URL will be inferred from your API Token.",
      },
      {
        name: "environment",
        label: "Environment",
        helpText:
          "Environment name. If you leave this blank, default environment will be used. You can find this in your DatoCMS project settings.",
      },
    ],
  },
} satisfies ProvidersConfig;

export type StrapiConfig = CreateProviderConfig<"strapi">;
export type ContentfulConfig = CreateProviderConfig<"contentful">;
export type DatocmsConfig = CreateProviderConfig<"datocms">;

export const strapiConfigSchema = z.object({
  name: z.string().min(1),
  token: z.string().min(1),
  baseUrl: z.string().url().min(1),
  contentTypeId: z.string().min(1),
});

export const contentfulConfigSchema = z.object({
  name: z.string().min(1),
  token: z.string().min(1),
  environment: z.string().min(1),
  spaceId: z.string().min(1),
  locale: z.string().min(1),
  contentId: z.string().min(1),
  baseUrl: z.string().url().optional().or(z.literal("")),
  apiRequestsPerSecond: z.number().optional().or(z.literal("")),
});

export const datocmsConfigSchema = z.object({
  name: z.string().min(1),
  token: z.string().min(1),
  itemTypeId: z.number().min(1),
  baseUrl: z.string().url().optional().or(z.literal("")),
  environment: z.string(),
});

export const providerCommonSchema = z.object({
  id: z.string(),
  providerName: z.string(),
});

export type ProviderCommonSchema = z.infer<typeof providerCommonSchema>;

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
