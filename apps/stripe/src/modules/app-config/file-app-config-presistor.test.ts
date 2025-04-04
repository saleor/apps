import { describe, it } from "vitest";

import { FileAppConfigPresistor } from "@/modules/app-config/file-app-config-presistor";
import { StripeConfig } from "@/modules/app-config/stripe-config";

describe("FileAppConfigPresistor", () => {
  it.skip("should work", () => {
    const presistor = new FileAppConfigPresistor();
    const stripeConfig = StripeConfig.createFromPersistedData({
      configName: "Test Config",
      configId: "Test Config ID",
      restrictedKeyValue: "rk_test_1234567890",
      publishableKeyValue: "pk_test_1234567890",
    })._unsafeUnwrap();

    presistor.persistStripeConfig({
      channelId: "Test Channel ID",
      config: stripeConfig,
      saleorApiUrl: "https://example.com/graphql/",
      appId: "Test App ID",
    });
  });
});
