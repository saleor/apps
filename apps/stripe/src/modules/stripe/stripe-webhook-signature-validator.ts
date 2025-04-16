import { fromThrowable } from "neverthrow";
import Stripe from "stripe";

import { StripeClient } from "@/modules/stripe/stripe-client";
import { StripeWebhookSecret } from "@/modules/stripe/stripe-webhook-secret";

import { IStripeEventVerify, StripeEventParsingError } from "./types";

export class StripeWebhookSignatureValidator implements IStripeEventVerify {
  private stripeSdkClient: Pick<Stripe, "webhooks">;

  private constructor(stripeApiWrapper: Pick<Stripe, "webhooks">) {
    this.stripeSdkClient = stripeApiWrapper;
  }

  static createFromClient(client: StripeClient) {
    return new StripeWebhookSignatureValidator(client.nativeClient);
  }

  verifyEvent = ({
    signatureHeader,
    webhookSecret,
    rawBody,
  }: {
    rawBody: string | Buffer;
    signatureHeader: string;
    webhookSecret: StripeWebhookSecret;
  }) => {
    return fromThrowable(
      /**
       * Bind Stripe because otherwise it lost it's internal this
       */
      this.stripeSdkClient.webhooks.constructEvent.bind(this.stripeSdkClient.webhooks),
      (err) =>
        new StripeEventParsingError("Failed to validate Stripe Event", {
          cause: err,
        }),
    )(rawBody, signatureHeader, webhookSecret.secretValue);
  };
}
