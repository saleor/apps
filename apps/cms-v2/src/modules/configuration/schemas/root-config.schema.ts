import { z } from "zod";
import { ChannelProviderConnectionConfig } from "./channel-provider-connection.schema";
import { ContentfulProviderConfig } from "./contentful-provider.schema";
import { DatocmsProviderConfig } from "./datocms-provider.schema";
import { StrapiProviderConfig } from "./strapi-provider.schema";

// todo move to shared bootstrap?
export namespace ProvidersConfig {
  const AnyFull = z.union([
    /**
     * Add more for each provider
     */
    ContentfulProviderConfig.Schema.Full,
    DatocmsProviderConfig.Schema.Full,
    StrapiProviderConfig.Schema.Full,
  ]);

  export const Schema = {
    AnyFull: AnyFull,
    AnyInput: z.union([
      ContentfulProviderConfig.Schema.Input,
      DatocmsProviderConfig.Schema.Input,
      StrapiProviderConfig.Schema.Input,
    ]),
    AnyFullList: z.array(AnyFull),
  };

  export type AnyFullShape = z.infer<typeof Schema.AnyFull>;
  export type AnyInputShape = z.infer<typeof Schema.AnyInput>;
}

export namespace RootConfig {
  /**
   * Store entire app config in single file
   * - Only one request
   * - Always transactional
   */
  export const Schema = z.object({
    providers: ProvidersConfig.Schema.AnyFullList,
    connections: z.array(ChannelProviderConnectionConfig.Schema.Full),
  });

  export type Shape = z.infer<typeof Schema>;
}
