import { z } from "zod";
import { ChannelProviderConnectionConfigSchema } from "./channel-provider-connection.schema";
import { ContentfulProviderSchema } from "./contentful-provider.schema";

/**
 * Store entire app config in single file
 * - Only one request
 * - Always transactional
 */
export const RootConfigSchema = z.object({
  providers: z.array(ContentfulProviderSchema.Config), // todo union
  connections: z.array(ChannelProviderConnectionConfigSchema.Connection),
});

export type RootConfigSchemaType = z.infer<typeof RootConfigSchema>;
