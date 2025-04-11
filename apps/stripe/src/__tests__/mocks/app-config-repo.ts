import { ok } from "neverthrow";
import { vi } from "vitest";

import { mockStripeWebhookSecret } from "@/__tests__/mocks/stripe-webhook-secret";
import { AppConfigRepo } from "@/modules/app-config/app-config-repo";
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
  webhookSecret: mockStripeWebhookSecret,
})._unsafeUnwrap();

export const mockedAppConfigRepo: AppConfigRepo = {
  getStripeConfig: async () => ok(mockedStripeConfig),
  saveStripeConfig: vi.fn(),
  updateStripeConfig: vi.fn(),
};
