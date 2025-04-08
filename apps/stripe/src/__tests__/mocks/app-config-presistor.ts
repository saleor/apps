import { ok } from "neverthrow";
import { vi } from "vitest";

import { AppConfigPersistor } from "@/modules/app-config/app-config-persistor";
import { StripeConfig } from "@/modules/app-config/stripe-config";
import { StripePublishableKey } from "@/modules/stripe/stripe-publishable-key";
import { StripeRestrictedKey } from "@/modules/stripe/stripe-restricted-key";

const mockedStripeConfig = StripeConfig.create({
  id: "config-id",
  name: "config-name",
  publishableKey: StripePublishableKey.create({
    publishableKey: "pk_live_1",
  })._unsafeUnwrap(),
  restrictedKey: StripeRestrictedKey.create({ restrictedKey: "rk_live_1" })._unsafeUnwrap(),
})._unsafeUnwrap();

export const mockedAppConfigPersistor: AppConfigPersistor = {
  getStripeConfig: async () => ok(mockedStripeConfig),
  saveStripeConfig: vi.fn(),
};
