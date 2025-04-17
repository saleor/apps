import { err, ok, Result } from "neverthrow";

import { BaseError } from "@/lib/errors";
import { StripeConfig } from "@/modules/app-config/stripe-config";
import { StripeClient } from "@/modules/stripe/stripe-client";
import { supportedStripeEvents } from "@/modules/stripe/supported-stripe-events";

// todo test

export class StripeWebhookManager {
  private buildWebhookUrl() {
    return ""; //todo
  }

  async createWebhook(config: StripeConfig): Promise<
    Result<
      {
        secret: string;
        id: string;
      },
      InstanceType<typeof BaseError>
    >
  > {
    const client = StripeClient.createFromRestrictedKey(config.restrictedKey);

    const webhookUrl = this.buildWebhookUrl();

    try {
      const result = await client.nativeClient.webhookEndpoints.create({
        url: webhookUrl,
        description: `Created by Saleor Stripe app, config name: ${config.name}`, //todo
        enabled_events: supportedStripeEvents,
        metadata: {
          saleorAppConfigurationId: config.id,
        },
      });

      const { secret, id } = result;

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
      // todo handle error
      return err(
        new BaseError("Error creating webhook", {
          cause: e,
        }),
      );
    }
  }
}
