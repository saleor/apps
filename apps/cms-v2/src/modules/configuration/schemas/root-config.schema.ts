import { z } from "zod";
import { ChannelProviderConnectionConfigSchema } from "./channel-provider-connection.schema";
import { ContentfulProviderSchema } from "./contentful-provider.schema";
import { DatocmsProviderSchema } from "./datocms-provider.schema";
import { StrapiProviderConfig } from "./strapi-provider.schema";

export const AnyProviderConfigSchema = z.union([
  /**
   * Add more for each provider
   */
  ContentfulProviderSchema.Config,
  DatocmsProviderSchema.Config,
  StrapiProviderConfig.Schema.Full,
]);

const AnyProvidersListSchema = z.array(AnyProviderConfigSchema);

export const AnyProvidersInput = z.union([
  ContentfulProviderSchema.ConfigInput,
  DatocmsProviderSchema.ConfigInput,
  StrapiProviderConfig.Schema.Input,
]);

/**
 * Store entire app config in single file
 * - Only one request
 * - Always transactional
 */
export const RootConfigSchema = z.object({
  providers: AnyProvidersListSchema,
  connections: z.array(ChannelProviderConnectionConfigSchema.Connection),
});

export type RootConfigSchemaType = z.infer<typeof RootConfigSchema>;

export type AnyProviderConfigSchemaType = z.infer<typeof AnyProviderConfigSchema>;
export type AnyProviderInputSchemaType = z.infer<typeof AnyProvidersInput>;
