import { createStripeRestrictedKey } from "@/modules/stripe/stripe-restricted-key";

export const mockedStripeRestrictedKey = createStripeRestrictedKey(
  "rk_live_AAAAABBBBCCCCCEEEEEEEFFFFFGGGGG",
)._unsafeUnwrap();
