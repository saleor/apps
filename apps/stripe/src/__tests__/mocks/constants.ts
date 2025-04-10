import { StripeWebhookSecret } from "@/modules/stripe/stripe-webhook-secret";

export const mockedSaleorChannelId = "saleor-channel-id";
export const mockedSaleorAppId = "saleor-app-id";
export const mockStripeWebhookSecretValue = "whsec_XYZ";
export const mockStripeWebhookSecret = StripeWebhookSecret.create(
  mockStripeWebhookSecretValue,
)._unsafeUnwrap();
