import { err, ok, Result } from "neverthrow";

import { WebhookParams } from "@/app/api/stripe/webhook/webhook-params";
import { BaseError } from "@/lib/errors";
import { createLogger } from "@/lib/logger";
import { NewStripeConfigInput } from "@/modules/app-config/trpc-handlers/new-stripe-config-input-schema";
import { SaleorApiUrl } from "@/modules/saleor/saleor-api-url";
import { StripeClient } from "@/modules/stripe/stripe-client";
import { supportedStripeEvents } from "@/modules/stripe/supported-stripe-events";

// todo test

export class StripeWebhookManager {
  private logger = createLogger("StripeWebhookManager");

  async createWebhook(
    config: NewStripeConfigInput & {
      configurationId: string;
    },
    { appUrl, saleorApiUrl }: { appUrl: string; saleorApiUrl: SaleorApiUrl },
  ): Promise<
    Result<
      {
        secret: string;
        id: string;
      },
      InstanceType<typeof BaseError>
    >
  > {
    this.logger.debug("Will create Stripe webhook");
    const client = StripeClient.createFromRestrictedKey(config.restrictedKey);

    const webhookUrl = new URL(appUrl + "/stripe/webhook");
    const wp = WebhookParams.createFromParams({
      saleorApiUrl: saleorApiUrl,
      configurationId: config.configurationId,
    });

    webhookUrl.searchParams.set(wp.configurationId, wp.configurationId);
    webhookUrl.searchParams.set(wp.saleorApiUrl, wp.saleorApiUrl);

    this.logger.debug("Resolved webhook url", {
      webhookUrl,
    });

    try {
      const result = await client.nativeClient.webhookEndpoints.create({
        url: webhookUrl.toString(),
        description: `Created by Saleor Stripe app, config name: ${config.name}`, //todo
        enabled_events: supportedStripeEvents,
        metadata: {
          saleorAppConfigurationId: config.configurationId,
        },
      });

      const { secret, id } = result;

      this.logger.info("Successfully created Stripe webhook", { id });

      if (!secret) {
        /**
         * According to docs, secret is optional, because it's only returned on creation.
         * Here we create it, so it must be there
         * If not, this is Panic
         */
        throw new BaseError("Stripe did not return secret from webhook. This should not happen");
      }

      return ok({ secret, id });
    } catch (e) {
      this.logger.warn("Error creating webhook", { error: e });

      // todo handle error
      return err(
        new BaseError("Error creating webhook", {
          cause: e,
        }),
      );
    }
  }
}
