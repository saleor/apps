import { captureException } from "@sentry/nextjs";
import { err, ok, Result } from "neverthrow";

import { StripeWebhookEventParser } from "@/app/api/stripe/webhook/stripe-webhook-event-parser";
import {
  StripeWebhookErrorResponse,
  StripeWebhookSuccessResponse,
} from "@/app/api/stripe/webhook/stripe-webhook-response";
import { WebhookParams } from "@/app/api/stripe/webhook/webhook-params";
import { BaseError } from "@/lib/errors";
import { saleorApp } from "@/lib/saleor-app";
import { AppConfigRepo } from "@/modules/app-config/app-config-repo";
import { StripeClient } from "@/modules/stripe/stripe-client";
import { StripeWebhookSignatureValidator } from "@/modules/stripe/stripe-webhook-signature-validator";

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

  constructor(deps: {
    appConfigRepo: AppConfigRepo;
    webhookEventParser: StripeWebhookEventParser;
  }) {
    this.appConfigRepo = deps.appConfigRepo;
    this.webhookEventParser = deps.webhookEventParser;
  }

  async execute({
    rawBody,
    signatureHeader,
    webhookParams,
  }: {
    /**
     * Raw request body for signature verification
     */
    rawBody: string;
    /**
     * Header that Stripe sends with webhook
     */
    signatureHeader: string;
    /**
     * Parsed params that come from Stripe Webhook
     */
    webhookParams: WebhookParams;
  }): R {
    const authData = await saleorApp.apl.get(webhookParams.saleorApiUrl.url);

    if (!authData) {
      captureException(
        new BaseError("AuthData from APL is empty, installation may be broken"),
        (s) => s.setLevel("warning"),
      );

      return err(
        new StripeWebhookErrorResponse(
          new BaseError("Missing Saleor Auth Data. App installation is broken"),
        ),
      );
    }

    const config = await this.appConfigRepo.getStripeConfig({
      channelId: webhookParams.channelId,
      appId: authData.appId,
      saleorApiUrl: webhookParams.saleorApiUrl,
    });

    if (config.isErr()) {
      const error = new BaseError("Failed to fetch config from database", {
        cause: config.error,
      });

      captureException(error);

      return err(new StripeWebhookErrorResponse(error));
    }

    if (!config.value) {
      return err(
        new StripeWebhookErrorResponse(
          new BaseError("Config missing, app is not configured properly"),
        ),
      );
    }

    const stripeClient = StripeClient.createFromRestrictedKey(config.value.restrictedKey);

    const event = await this.webhookEventParser.verifyRequestAndGetEvent({
      rawBody,
      webhookSecret: config.value.webhookSecret.secretValue,
      signatureValidator: StripeWebhookSignatureValidator.createFromClient(stripeClient),
      signatureHeader,
    });

    if (event.isErr()) {
      return err(new StripeWebhookErrorResponse(event.error));
    }

    // todo: business logic with webhook here

    return ok(new StripeWebhookSuccessResponse()); // todo
  }
}

// todo add webhook result
