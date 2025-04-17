import { createStripeWebhookSecret } from "@/modules/stripe/stripe-webhook-secret";

export const mockStripeWebhookSecret = createStripeWebhookSecret("whsec_XYZ")._unsafeUnwrap();
