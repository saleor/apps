import { err, ok, Result } from "neverthrow";
import Stripe from "stripe";

import { BaseError } from "@/lib/errors";
import { StripeWebhookSignatureValidator } from "@/modules/stripe/stripe-webhook-signature-validator";

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
    webhookSecret,
    signatureValidator,
    signatureHeader,
  }: {
    rawBody: string;
    webhookSecret: string;
    signatureValidator: StripeWebhookSignatureValidator;
    signatureHeader: string;
  }): Promise<Result<Stripe.Event, ErrorResult>> {
    try {
      const validEvent = signatureValidator.verifySignature({
        rawBody: rawBody,
        webhookSecret,
        signatureHeader,
      });

      if (validEvent.isErr()) {
        throw validEvent.error;
      }

      return ok(validEvent.value);
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
