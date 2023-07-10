import { z } from "zod";
import { ChannelProviderConnectionConfigSchema } from "./channel-provider-connection.schema";
import { ContentfulProviderSchema } from "./contentful-provider.schema";

/**
 * Add more for each provider
 */
const ProvidersSchema = z.array(ContentfulProviderSchema.Config); // todo union

/**
 * Store entire app config in single file
 * - Only one request
 * - Always transactional
 */
export const RootConfigSchema = z.object({
  providers: ProvidersSchema,
  connections: z.array(ChannelProviderConnectionConfigSchema.Connection),
});

export type RootConfigSchemaType = z.infer<typeof RootConfigSchema>;

export type AnyProviderConfigSchemaType = RootConfigSchemaType["providers"][0];
