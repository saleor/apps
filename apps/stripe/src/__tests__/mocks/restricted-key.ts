import { StripeRestrictedKey } from "@/modules/stripe/stripe-restricted-key";

export const mockRestrictedKey = StripeRestrictedKey.create({
  restrictedKey: "rk_live_AAAAABBBBCCCCCEEEEEEEFFFFFGGGGG",
})._unsafeUnwrap();
