import { APL } from "@saleor/app-sdk/APL";
import { captureException } from "@sentry/nextjs";
import { err, ok, Result } from "neverthrow";

import {
  StripeWebhookErrorResponse,
  StripeWebhookSuccessResponse,
} from "@/app/api/stripe/webhook/stripe-webhook-response";
import { WebhookParams } from "@/app/api/stripe/webhook/webhook-params";
import { BaseError } from "@/lib/errors";
import { createLogger } from "@/lib/logger";
import { AppConfigRepo } from "@/modules/app-config/app-config-repo";
import { StripeClient } from "@/modules/stripe/stripe-client";
import { IStripeEventVerify } from "@/modules/stripe/types";

type SuccessResult = StripeWebhookSuccessResponse;
type ErrorResult = StripeWebhookErrorResponse;

type R = Promise<Result<SuccessResult, ErrorResult>>;

type StripeVerificateEventFactory = (stripeClient: StripeClient) => IStripeEventVerify;

/**
 * TODO: We need to store events to DB to handle deduplication
 */
export class StripeWebhookUseCase {
  private appConfigRepo: AppConfigRepo;
  private webhookEventVerifyFactory: StripeVerificateEventFactory;
  private apl: APL;
  private logger = createLogger("StripeWebhookUseCase");

  constructor(deps: {
    appConfigRepo: AppConfigRepo;
    webhookEventVerifyFactory: StripeVerificateEventFactory;
    apl: APL;
  }) {
    this.appConfigRepo = deps.appConfigRepo;
    this.webhookEventVerifyFactory = deps.webhookEventVerifyFactory;
    this.apl = deps.apl;
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
    const authData = await this.apl.get(webhookParams.saleorApiUrl);

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
      configId: webhookParams.configurationId,
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
    const eventVerifier = this.webhookEventVerifyFactory(stripeClient);

    const event = eventVerifier.verifyEvent({
      rawBody,
      webhookSecret: config.value.webhookSecret,
      signatureHeader,
    });

    if (event.isErr()) {
      return err(new StripeWebhookErrorResponse(event.error));
    }

    // todo: business logic with webhook here

    return ok(new StripeWebhookSuccessResponse()); // todo
  }
}
