import { mockedConfigurationId } from "@/__tests__/mocks/constants";
import { mockedStripePublishableKey } from "@/__tests__/mocks/mocked-stripe-publishable-key";
import { mockedStripeRestrictedKey } from "@/__tests__/mocks/mocked-stripe-restricted-key";
import { mockStripeWebhookSecret } from "@/__tests__/mocks/stripe-webhook-secret";
import { StripeConfig } from "@/modules/app-config/stripe-config";

export const mockedStripeConfig = StripeConfig.create({
  id: mockedConfigurationId,
  name: "config-name",
  publishableKey: mockedStripePublishableKey,
  restrictedKey: mockedStripeRestrictedKey,
  webhookSecret: mockStripeWebhookSecret,
  webhookId: "wh_123456789",
})._unsafeUnwrap();
