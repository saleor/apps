import { z } from "zod";
import { ChannelProviderConnectionConfigSchema } from "./channel-provider-connection.schema";
import { ContentfulProviderSchema } from "./contentful-provider.schema";
import { DatocmsProviderSchema } from "./datocms-provider.schema";

export const AnyProviderConfigSchema = z.union([
  /**
   * Add more for each provider
   */
  ContentfulProviderSchema.Config,
  DatocmsProviderSchema.Config,
]);

const AnyProvidersListSchema = z.array(AnyProviderConfigSchema);

export const AnyProvidersInput = z.union([
  ContentfulProviderSchema.ConfigInput,
  DatocmsProviderSchema.ConfigInput,
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

export type AnyProviderConfigSchemaType = RootConfigSchemaType["providers"][0];
export type AnyProviderInputSchemaType = z.infer<typeof AnyProvidersInput>;
