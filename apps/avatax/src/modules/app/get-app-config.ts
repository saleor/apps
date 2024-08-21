import { decrypt } from "@saleor/app-sdk/settings-manager";

import { MetadataItem } from "../../../generated/graphql";
import { ChannelsConfig, channelsSchema } from "../channel-configuration/channel-config";
import {
  ProviderConnections,
  providerConnectionsSchema,
} from "../provider-connections/provider-connections";

/**
 * TODO: Refactor, use DI to inject encrypt/decrypt logic
 */
export const getAppConfig = (metadata: MetadataItem[]) => {
  let providerConnections = [] as ProviderConnections;
  let channelsConfig = {} as ChannelsConfig;

  const secretKey = process.env.SECRET_KEY;

  if (!secretKey) {
    throw new Error("SECRET_KEY env variable is not set");
  }

  /**
   * The App Config contains two types of data: providers and channels.
   * We must recognize which one we are dealing with and parse it accordingly.
   */
  metadata?.forEach((item) => {
    const decrypted = decrypt(item.value, secretKey);
    const parsed = JSON.parse(decrypted);

    const providerConnectionValidation = providerConnectionsSchema.safeParse(parsed);

    if (providerConnectionValidation.success) {
      providerConnections = providerConnectionValidation.data;
      return;
    }

    const channelsValidation = channelsSchema.safeParse(parsed);

    if (channelsValidation.success) {
      channelsConfig = channelsValidation.data;
      return;
    }
  });

  return { providerConnections: providerConnections, channels: channelsConfig };
};
