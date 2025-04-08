import { ok, Result } from "neverthrow";
import Stripe from "stripe";

import { BaseError } from "@/lib/errors";
import { IStripePaymentIntentsApi } from "@/modules/stripe/types";

export class MockedStripePaymentIntentsApi implements IStripePaymentIntentsApi {
  async createPaymentIntent(args: {
    params: Stripe.PaymentIntentCreateParams;
  }): Promise<Result<Stripe.PaymentIntent, InstanceType<typeof BaseError>>> {
    const paymentIntentResponse = {
      id: "payment-intent-id",
      object: "payment_intent",
      amount: args.params.amount,
    } as Stripe.PaymentIntent;

    return ok(paymentIntentResponse);
  }
}
