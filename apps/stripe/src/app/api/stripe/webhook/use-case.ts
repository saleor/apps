import { ok, Result } from "neverthrow";

import { StripeWebhookEventParser } from "@/app/api/stripe/webhook/stripe-webhook-event-parser";
import {
  StripeWebhookErrorResponse,
  StripeWebhookSuccessResponse,
} from "@/app/api/stripe/webhook/stripe-webhook-response";
import { AppConfigRepo } from "@/modules/app-config/app-config-repo";

type SuccessResult = StripeWebhookSuccessResponse;
type ErrorResult = StripeWebhookErrorResponse;

type R = Promise<Result<SuccessResult, ErrorResult>>;

/**
 * TODO: Should we have single webhook per app or per channel?
 * - Webhook per config
 * - Webhook per app
 * - Should channel ID be in URL param or payload? check security. Better URL and metadata is non critical
 *
 * TODO: Check where and how to handle deduplication
 */
export class StripeWebhookUseCase {
  private appConfigRepo: AppConfigRepo;
  private webhookEventParser: StripeWebhookEventParser;

  constructor(deps: { appConfigRepo: AppConfigRepo }) {
    this.appConfigRepo = deps.appConfigRepo;
  }

  async execute({
    rawBody,
    signatureHeader,
  }: {
    /**
     * Raw request body for signature verification
     */
    rawBody: string;
    /**
     * Header that Stripe sends with webhook
     */
    signatureHeader: string;
  }): R {
    const event = await this.webhookEventParser.verifyRequestAndGetEvent({
      rawBody,
      stripeConfig,
      stripeClient,
      signatureHeader,
    });

    // todo: business logic with webhook here

    return ok(new StripeWebhookSuccessResponse()); // todo
  }
}

// todo add webhook result
