import { z } from "zod";
import { ChannelProviderConnectionConfig } from "./channel-provider-connection.schema";
import { ContentfulProviderConfig } from "./contentful-provider.schema";
import { DatocmsProviderConfig } from "./datocms-provider.schema";
import { StrapiProviderConfig } from "./strapi-provider.schema";

// todo move to shared bootstrap?
export namespace ProvidersConfig {
  export const AnyProviderConfigSchema = z.union([
    /**
     * Add more for each provider
     */
    ContentfulProviderConfig.Schema.Full,
    DatocmsProviderConfig.Schema.Full,
    StrapiProviderConfig.Schema.Full,
  ]);

  export const AnyProvidersListSchema = z.array(AnyProviderConfigSchema);

  export const AnyProvidersInput = z.union([
    ContentfulProviderConfig.Schema.Input,
    DatocmsProviderConfig.Schema.Input,
    StrapiProviderConfig.Schema.Input,
  ]);

  export type AnyProviderConfigSchemaType = z.infer<typeof AnyProviderConfigSchema>;
  export type AnyProviderInputSchemaType = z.infer<typeof AnyProvidersInput>;
}

export namespace RootConfig {
  /**
   * Store entire app config in single file
   * - Only one request
   * - Always transactional
   */
  export const Schema = z.object({
    providers: ProvidersConfig.AnyProvidersListSchema,
    connections: z.array(ChannelProviderConnectionConfig.Schema.Full),
  });

  export type Shape = z.infer<typeof Schema>;

  export type RootConfigSchemaType = z.infer<typeof Schema>;
}
