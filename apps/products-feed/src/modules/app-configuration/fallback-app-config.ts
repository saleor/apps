import { AppConfig } from "./app-config";
import { AppConfigContainer } from "./app-config-container";
import { ChannelFragment } from "../../../generated/graphql";

/**
 * TODO remove fallback strategy
 * @deprecated
 */
export const FallbackAppConfig = {
  createFallbackConfigFromExistingShopAndChannels(channels: ChannelFragment[]) {
    return (channels ?? []).reduce<AppConfig>(
      (state, channel) => {
        return AppConfigContainer.setChannelUrlConfiguration(state)(channel.slug)({
          storefrontUrl: "",
          productStorefrontUrl: "",
        });
      },
      { shopConfigPerChannel: {} }
    );
  },
};
