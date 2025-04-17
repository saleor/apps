import { createStripePublishableKey } from "@/modules/stripe/stripe-publishable-key";

export const mockedStripePublishableKey = createStripePublishableKey("pk_live_1")._unsafeUnwrap();
