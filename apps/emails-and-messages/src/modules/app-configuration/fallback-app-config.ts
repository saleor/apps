import { AppConfig } from "./app-config";
import { AppConfigContainer, getDefaultEmptyAppConfiguration } from "./app-config-container";
import { ChannelFragment, ShopInfoFragment } from "../../../generated/graphql";

/**
 * TODO Test
 */
export const FallbackAppConfig = {
  createFallbackConfigFromExistingShopAndChannels(
    channels: ChannelFragment[],
    shopAppConfiguration: ShopInfoFragment | null
  ) {
    return (channels ?? []).reduce<AppConfig>(
      (state, channel) => {
        return AppConfigContainer.setChannelAppConfiguration(state)(channel.slug)(
          getDefaultEmptyAppConfiguration()
        );
      },
      { configurationsPerChannel: {} }
    );
  },
};
