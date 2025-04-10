import { err, ok, Result } from "neverthrow";
import Stripe from "stripe";

import { BaseError } from "@/lib/errors";
import { StripeConfig } from "@/modules/app-config/stripe-config";
import { StripeClient } from "@/modules/stripe/stripe-client";

type Errors = typeof StripeWebhookEventParser.InvalidSignatureError;
type ErrorResult = InstanceType<Errors>;

/**
 * Checks if Webhook is not forged. Returns valid event or error
 *
 * https://github.com/stripe/stripe-node/blob/master/examples/webhook-signing/nextjs/app/api/webhooks/route.ts
 * https://github.com/stripe/stripe-node#webhook-signing
 * https://docs.stripe.com/webhooks#verify-webhook-signatures-with-official-libraries
 */
export class StripeWebhookEventParser {
  static InvalidSignatureError = BaseError.subclass("InvalidSignatureError", {
    props: {
      _internalType: "InvalidSignatureError",
    },
  });

  async verifyRequestAndGetEvent({
    rawBody,
    stripeConfig,
    stripeClient,
    signatureHeader,
  }: {
    rawBody: string;
    stripeConfig: StripeConfig;
    stripeClient: StripeClient;
    signatureHeader: string;
  }): Promise<Result<Stripe.Event, ErrorResult>> {
    try {
      const webhookSecret = stripeConfig.webhookSecret;

      // todo wrap stripe api with facade
      const validEvent = stripeClient.nativeClient.webhooks.constructEvent(
        rawBody,
        signatureHeader,
        webhookSecret,
      );

      return ok(validEvent);
    } catch (e) {
      return err(
        new StripeWebhookEventParser.InvalidSignatureError(
          "Failed to extract Event from Stripe webhook",
          {
            cause: e,
          },
        ),
      );
    }
  }
}
