import { fromThrowable } from "neverthrow";
import Stripe from "stripe";

import { StripeEventParsingError } from "@/modules/stripe/errors";
import { StripeClient } from "@/modules/stripe/stripe-client";

import { IStripeSignatureVerify } from "./types";

export class StripeWebhookSignatureValidator implements IStripeSignatureVerify {
  private stripeSdkClient: Pick<Stripe, "webhooks">;

  private constructor(stripeApiWrapper: Pick<Stripe, "webhooks">) {
    this.stripeSdkClient = stripeApiWrapper;
  }

  static createFromClient(client: StripeClient) {
    return new StripeWebhookSignatureValidator(client.nativeClient);
  }

  verifySignature({
    signatureHeader,
    webhookSecret,
    rawBody,
  }: {
    rawBody: string;
    signatureHeader: string;
    webhookSecret: string;
  }) {
    return fromThrowable(
      this.stripeSdkClient.webhooks.constructEvent,
      (err) =>
        new StripeEventParsingError("Failed to validate Stripe Event", {
          cause: err,
        }),
    )(rawBody, signatureHeader, webhookSecret);
  }
}
