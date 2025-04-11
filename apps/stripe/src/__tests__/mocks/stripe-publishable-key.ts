import { StripePublishableKey } from "@/modules/stripe/stripe-publishable-key";

export const stripePublishableKey = StripePublishableKey.create({
  publishableKey: "pk_live_1",
})._unsafeUnwrap();
