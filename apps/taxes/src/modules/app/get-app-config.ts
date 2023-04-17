import { decrypt } from "@saleor/app-sdk/settings-manager";
import { MetadataItem } from "../../../generated/graphql";
import { ChannelsConfig, channelsSchema } from "../channels-configuration/channels-config";
import { ProvidersConfig, providersSchema } from "../providers-configuration/providers-config";

export const getAppConfig = (metadata: MetadataItem[]) => {
  let providersConfig = [] as ProvidersConfig;
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

    const providersValidation = providersSchema.safeParse(parsed);

    if (providersValidation.success) {
      providersConfig = providersValidation.data;
      return;
    }

    const channelsValidation = channelsSchema.safeParse(parsed);

    if (channelsValidation.success) {
      channelsConfig = channelsValidation.data;
      return;
    }
  });

  return { providers: providersConfig, channels: channelsConfig };
};
