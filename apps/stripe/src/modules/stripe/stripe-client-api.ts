import { ResultAsync } from "neverthrow";
import Stripe from "stripe";

import { env } from "@/lib/env";
import { BaseError } from "@/lib/errors";
import { StripePublishableKey } from "@/modules/stripe/stripe-publishable-key";
import pkg from "@/package.json";

export class StripeClientApi {
  static PingTokensCreateError = BaseError.subclass("PingTokensCreateError");

  private constructor(
    private deps: {
      stripeApiWrapper: Pick<Stripe, "tokens">;
    },
  ) {}

  static createFromKey(args: { key: StripePublishableKey }) {
    const stripeApiWrapper = new Stripe(args.key.getKeyValue(), {
      typescript: true,
      httpClient: Stripe.createFetchHttpClient(fetch), // this allow us to mock the fetch
      appInfo: {
        name: "Saleor App Payment Stripe",
        version: pkg.version,
        url: "https://apps.saleor.io/apps/stripe",
        partner_id: env.STRIPE_PARTNER_ID,
      },
    });

    return new StripeClientApi({ stripeApiWrapper });
  }

  pingTokensCreate() {
    return ResultAsync.fromPromise(
      this.deps.stripeApiWrapper.tokens.create({
        pii: { id_number: "test" },
      }),
      (error) =>
        new StripeClientApi.PingTokensCreateError("Failed to ping tokens create", {
          cause: error,
        }),
    );
  }
}
