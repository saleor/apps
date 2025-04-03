import Stripe from "stripe";

import { StripeServerApi } from "@/modules/stripe/stripe-server-api";

export class StripeSecretKey {
  // TODO: use this to validate the keys on client side
  static testPrefix = "sk_test_";
  static livePrefix = "sk_live_";

  private constructor(private key: string) {}

  static createFromUserInput(args: { secretKey: string }) {
    return new StripeSecretKey(args.secretKey);
  }

  isValid() {
    // Stripe API doesn't have a way to validate the keys - we need to call the API and check if it returns an authentication error.
    const stripeServerApi = StripeServerApi.createFromKey({
      key: this,
    });
    const pingResult = stripeServerApi.pingPaymentIntents();

    return pingResult.match(
      () => true,
      (error) => {
        // validate this in real life scenario - in previous implementation we used Stripe.errors.StripeError
        if (error.cause instanceof Stripe.errors.StripeAuthenticationError) {
          return false;
        }

        return true;
      },
    );
  }

  getKeyValue() {
    return this.key;
  }
}
