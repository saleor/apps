import Stripe from "stripe";

import { env } from "@/lib/env";
import { StripeRestrictedKey } from "@/modules/stripe/stripe-restricted-key";
import pkg from "@/package.json";

/**
 * Holds native client,
 * provides a single initialization place for Stripe SDK
 */
export class StripeClient {
  readonly nativeClient: Stripe;

  constructor(nativeClient: Stripe) {
    this.nativeClient = nativeClient;
  }

  static createFromRestrictedKey(key: StripeRestrictedKey) {
    const nativeClient = new Stripe(key, {
      typescript: true,
      httpClient: Stripe.createFetchHttpClient(fetch), // this allow us to mock the fetch
      appInfo: {
        name: "Saleor App Stripe",
        version: pkg.version,
        url: env.APPSTORE_URL,
        partner_id: env.STRIPE_PARTNER_ID,
      },
    });

    return new StripeClient(nativeClient);
  }
}
