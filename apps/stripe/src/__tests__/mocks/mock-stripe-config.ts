import { mockStripeWebhookSecret } from "@/__tests__/mocks/stripe-webhook-secret";
import { StripeConfig } from "@/modules/app-config/stripe-config";
import { StripePublishableKey } from "@/modules/stripe/stripe-publishable-key";
import { StripeRestrictedKey } from "@/modules/stripe/stripe-restricted-key";

export const mockedStripeConfig = StripeConfig.create({
  id: "config-id",
  name: "config-name",
  publishableKey: StripePublishableKey.create({
    publishableKey: "pk_live_1",
  })._unsafeUnwrap(),
  restrictedKey: StripeRestrictedKey.create({ restrictedKey: "rk_live_1" })._unsafeUnwrap(),
  webhookSecret: mockStripeWebhookSecret,
})._unsafeUnwrap();
