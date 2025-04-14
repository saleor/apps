import { StripeRestrictedKey } from "@/modules/stripe/stripe-restricted-key";

export const mockedRestrictedKey = StripeRestrictedKey.create({
  restrictedKey: "rk_live_AAAAABBBBCCCCCEEEEEEEFFFFFGGGGG",
})._unsafeUnwrap();
