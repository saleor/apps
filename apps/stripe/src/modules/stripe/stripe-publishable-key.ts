import Stripe from "stripe";

import { AppConfig } from "@/modules/app-config/app-config";
import { StripeClientApi } from "@/modules/stripe/stripe-client-api";

export class StripePublishableKey {
  // TODO: use this to validate the keys on client side
  static testPrefix = "pk_test_";
  static livePrefix = "pk_live_";

  private constructor(private key: string) {}

  static createFromUserInput(args: { publishableKey: string }) {
    return new StripePublishableKey(args.publishableKey);
  }

  static createFromAppConfig(args: { appConfig: AppConfig }) {
    return new StripePublishableKey(args.appConfig.getStripePublishableKey());
  }

  isValid() {
    // Stripe API doesn't have a way to validate the keys - we need to call the API and check if it returns an authentication error.
    const stripeClientApi = StripeClientApi.createFromKey({
      key: this,
    });

    // Based on https://stackoverflow.com/a/61001462/704894
    const pingResult = stripeClientApi.pingTokensCreate();

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
