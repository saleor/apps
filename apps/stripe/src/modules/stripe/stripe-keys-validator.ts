import Stripe from "stripe";

import { StripeApiClient } from "@/modules/stripe/stripe-api-client";

// TODO: add checks for specific instance keys types on client side - e.g secret keys starts with `sk_test_` or `sk_live_`

/**
 * Validator that should be used inside tRPC to validate the keys before we save them into configuration. Key types docs - https://docs.stripe.com/keys#obtain-api-keys
 *
 * Stripe API doesn't have a way to validate the keys - we need to call the API and check if it returns an authentication error.
 * We call `payment_intents.list` for secret key and `tokens.create` for publishable key.
 */
export class StripeKeysValidator {
  isSecretKeyValid(args: { secretKey: string }) {
    const stripeSecretKeyApiClient = StripeApiClient.createFromKey({
      key: args.secretKey,
    });

    const pingResult = stripeSecretKeyApiClient.pingPaymentIntents();

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

  isPublishableKeyValid(args: { publishableKey: string }) {
    const stripePublishableKeyApiClient = StripeApiClient.createFromKey({
      key: args.publishableKey,
    });

    // Based on https://stackoverflow.com/a/61001462/704894
    const pingResult = stripePublishableKeyApiClient.pingTokensCreate();

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

  isRestritedKeyValid(_args: { restrictedKey: string }) {
    // TODO: check if in current implementation we can use restricted keys - preivously we coudn't
    return false;
  }
}
