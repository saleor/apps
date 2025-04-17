import { createStripePaymentIntentId } from "@/modules/stripe/stripe-payment-intent-id";

export const mockedStripePaymentIntentId =
  createStripePaymentIntentId("pi_TEST_TEST_TEST")._unsafeUnwrap();
