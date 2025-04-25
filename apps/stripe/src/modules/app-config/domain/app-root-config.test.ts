import { describe, expect, it } from "vitest";

import { mockedStripeConfig } from "@/__tests__/mocks/mock-stripe-config";
import { AppRootConfig } from "@/modules/app-config/domain/app-root-config";
import { StripeConfig } from "@/modules/app-config/domain/stripe-config";

describe("AppRootConfig", () => {
  describe("getAllConfigsAsList", () => {
    it("Returnes stored configs as list", () => {
      const appRootConfig = new AppRootConfig(
        {
          "channel-1": "config-1",
        },
        {
          [mockedStripeConfig.id]: mockedStripeConfig,
          "config-2": StripeConfig.create({
            name: "c2",
            webhookId: mockedStripeConfig.webhookId,
            webhookSecret: mockedStripeConfig.webhookSecret,
            publishableKey: mockedStripeConfig.publishableKey,
            restrictedKey: mockedStripeConfig.restrictedKey,
            id: "config-2",
          })._unsafeUnwrap(),
        },
      );

      expect(appRootConfig.getAllConfigsAsList()).toMatchInlineSnapshot(`
        [
          StripeConfig {
            "id": "81f323bd-91e2-4838-ab6e-5affd81ffc3b",
            "name": "config-name",
            "publishableKey": "pk_live_1",
            "restrictedKey": "rk_live_AAAAABBBBCCCCCEEEEEEEFFFFFGGGGG",
            "webhookId": "wh_123456789",
            "webhookSecret": "whsec_XYZ",
          },
          StripeConfig {
            "id": "config-2",
            "name": "c2",
            "publishableKey": "pk_live_1",
            "restrictedKey": "rk_live_AAAAABBBBCCCCCEEEEEEEFFFFFGGGGG",
            "webhookId": "wh_123456789",
            "webhookSecret": "whsec_XYZ",
          },
        ]
      `);
    });
  });
});
