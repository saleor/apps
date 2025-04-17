import { err, ok, Result } from "neverthrow";
import Stripe from "stripe";

import { BaseError } from "@/lib/errors";
import { StripeClient } from "@/modules/stripe/stripe-client";

// todo test
export class StripeAuthValidator {
  stripe: Stripe;

  static AuthError = BaseError.subclass("StripeAuthValidator.AuthError", {
    props: {
      _internalName: "StripeAuthValidator.AuthError" as const,
    },
  });

  private constructor(stripe: Stripe) {
    this.stripe = stripe;
  }

  static createFromClient(client: StripeClient) {
    return new StripeAuthValidator(client.nativeClient);
  }

  /**
   * Checks if restricted keys is valid. Infers permissions scope by calling APIs that are needed by app
   */
  async validateStripeAuth(): Promise<
    Result<null, InstanceType<typeof StripeAuthValidator.AuthError>>
  > {
    try {
      await this.stripe.paymentIntents.list({ limit: 1 });

      return ok(null);
    } catch (e) {
      return err(
        new StripeAuthValidator.AuthError("Failed to authorize with Stripe", { cause: e }),
      );
    }
  }
}
