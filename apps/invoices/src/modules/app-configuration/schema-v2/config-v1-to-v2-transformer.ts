import { AppConfigV1 } from "../schema-v1/app-config-v1";
import { AppConfigV2 } from "./app-config";

export class ConfigV1ToV2Transformer {
  transform(v1Config: AppConfigV1): AppConfigV2 {
    const configV2 = new AppConfigV2();

    if (!v1Config || !v1Config.shopConfigPerChannel) {
      return configV2;
    }

    Object.entries(v1Config.shopConfigPerChannel).forEach(([channelSlug, channelConfigV1]) => {
      const addressV1 = channelConfigV1.address;

      configV2.upsertOverride(channelSlug, {
        city: addressV1.city ?? "",
        country: addressV1.country ?? "",
        streetAddress2: addressV1.streetAddress2 ?? "",
        postalCode: addressV1.postalCode ?? "",
        companyName: addressV1.companyName ?? "",
        streetAddress1: addressV1.streetAddress1 ?? "",
        countryArea: addressV1.countryArea ?? "",
        cityArea: addressV1.cityArea ?? "",
      });
    });

    return configV2;
  }
}
