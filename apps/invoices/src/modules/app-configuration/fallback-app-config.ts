import { AppConfig } from "./app-config";
import { AppConfigContainer } from "./app-config-container";
import { ChannelFragment, ShopInfoFragment } from "../../../generated/graphql";

/**
 * TODO Test
 */
export const FallbackAppConfig = {
  createFallbackConfigFromExistingShopAndChannels(
    channels: ChannelFragment[],
    shopAddress: ShopInfoFragment | null
  ) {
    return (channels ?? []).reduce<AppConfig>(
      (state, channel) => {
        return AppConfigContainer.setChannelAddress(state)(channel.slug)({
          city: shopAddress?.companyAddress?.city ?? "",
          cityArea: shopAddress?.companyAddress?.cityArea ?? "",
          companyName: shopAddress?.companyAddress?.companyName ?? "",
          country: shopAddress?.companyAddress?.country.country ?? "",
          countryArea: shopAddress?.companyAddress?.countryArea ?? "",
          postalCode: shopAddress?.companyAddress?.postalCode ?? "",
          streetAddress1: shopAddress?.companyAddress?.streetAddress1 ?? "",
          streetAddress2: shopAddress?.companyAddress?.streetAddress2 ?? "",
        });
      },
      { shopConfigPerChannel: {} }
    );
  },
};
