import { mockStripeWebhookSecretValue } from "@/__tests__/mocks/constants";
import { StripeWebhookSecret } from "@/modules/stripe/stripe-webhook-secret";

export const mockStripeWebhookSecret = StripeWebhookSecret.create(
  mockStripeWebhookSecretValue,
)._unsafeUnwrap();