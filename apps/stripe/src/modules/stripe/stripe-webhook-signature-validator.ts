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

  verifyEvent({
    signatureHeader,
    webhookSecret,
    rawBody,
  }: {
    rawBody: string;
    signatureHeader: string;
    webhookSecret: StripeWebhookSecret;
  }) {
    return fromThrowable(
      this.stripeSdkClient.webhooks.constructEvent,
      (err) =>
        new StripeEventParsingError("Failed to validate Stripe Event", {
          cause: err,
        }),
    )(rawBody, signatureHeader, webhookSecret.secretValue);
  }
}
