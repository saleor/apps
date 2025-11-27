import { captureException } from "@sentry/nextjs";
import { err, ok, Result } from "neverthrow";

import { WebhookParams } from "@/app/api/webhooks/stripe/webhook-params";
import { BaseError } from "@/lib/errors";
import { createLogger } from "@/lib/logger";
import { NewStripeConfigInput } from "@/modules/app-config/trpc-handlers/new-stripe-config-input-schema";
import { SaleorApiUrl } from "@/modules/saleor/saleor-api-url";
import { StripeClient } from "@/modules/stripe/stripe-client";
import { StripeRestrictedKey } from "@/modules/stripe/stripe-restricted-key";
import { StripeWebhookUrlBuilder } from "@/modules/stripe/stripe-webhook-url-builder";
import { supportedStripeEvents } from "@/modules/stripe/supported-stripe-events";

import { STRIPE_API_VERSION } from "./stripe-api-version";

const CantCreateWebhookUrlError = BaseError.subclass("CantCreateWebhookUrlError", {
  props: {
    _internalName: "StripeWebhookManagerErrors.CantCreateWebhookUrlError" as const,
  },
});

const InvalidDataError = BaseError.subclass("InvalidDataError", {
  props: {
    _internalName: "StripeWebhookManagerErrors.InvalidDataError" as const,
  },
});

const CantCreateWebhookError = BaseError.subclass("CantCreateWebhookError", {
  props: {
    _internalName: "StripeWebhookManagerErrors.CantCreateWebhookError" as const,
  },
});

const CantRemoveWebhookError = BaseError.subclass("CantRemoveWebhookError", {
  props: {
    _internalName: "StripeWebhookManagerErrors.CantRemoveWebhookError" as const,
  },
});

const CantFetchWebhookError = BaseError.subclass("CantRemoveWebhookError", {
  props: {
    _internalName: "StripeWebhookManagerErrors.CantRemoveWebhookError" as const,
  },
});

export const StripeWebhookManagerErrors = {
  CantCreateWebhookUrlError,
  CantCreateWebhookError,
  CantRemoveWebhookError,
  CantFetchWebhookError,
};

export class StripeWebhookManager {
  private logger = createLogger("StripeWebhookManager");
  private urlBuilder = new StripeWebhookUrlBuilder();

  async getWebhook({
    webhookId,
    restrictedKey,
  }: {
    webhookId: string;
    restrictedKey: StripeRestrictedKey;
  }) {
    try {
      const client = StripeClient.createFromRestrictedKey(restrictedKey);

      const webhook = await client.nativeClient.webhookEndpoints.retrieve(webhookId);

      return ok({
        status: webhook.status as "enabled" | "disabled",
      });
    } catch (e) {
      this.logger.warn("Error retrieving webhook", { error: e });

      return err(new CantFetchWebhookError("Error retrieving webhook", { cause: e }));
    }
  }

  async removeWebhook({
    webhookId,
    restrictedKey,
  }: {
    webhookId: string;
    restrictedKey: StripeRestrictedKey;
  }) {
    try {
      const client = StripeClient.createFromRestrictedKey(restrictedKey);

      await client.nativeClient.webhookEndpoints.del(webhookId);

      this.logger.info("Successfully removed Stripe webhook", { id: webhookId });

      return ok(null);
    } catch (e) {
      this.logger.warn("Error removing webhook", { error: e });

      return err(new CantRemoveWebhookError("Error removing webhook", { cause: e }));
    }
  }

  async createWebhook(
    config: NewStripeConfigInput & {
      configurationId: string;
    },
    { appUrl, saleorApiUrl, appId }: { appUrl: string; saleorApiUrl: SaleorApiUrl; appId: string },
  ): Promise<
    Result<
      {
        secret: string;
        id: string;
      },
      InstanceType<
        | typeof StripeWebhookManagerErrors.CantCreateWebhookUrlError
        | typeof StripeWebhookManagerErrors.CantCreateWebhookError
      >
    >
  > {
    this.logger.debug("Will create Stripe webhook");
    const client = StripeClient.createFromRestrictedKey(config.restrictedKey);

    const webhookUrl = this.urlBuilder.buildUrl({
      appUrl,
      webhookParams: WebhookParams.createFromParams({
        saleorApiUrl: saleorApiUrl,
        configurationId: config.configurationId,
        appId,
      }),
    });

    if (webhookUrl.isErr()) {
      captureException(
        new CantCreateWebhookUrlError("Failed to build URL", {
          cause: webhookUrl.error,
        }),
      );

      return err(new CantCreateWebhookUrlError("Cant create URL"));
    }

    this.logger.debug("Resolved webhook url", {
      webhookUrl,
    });

    try {
      const result = await client.nativeClient.webhookEndpoints.create({
        url: webhookUrl.value.toString(),
        description: `Created by Saleor App Payment Stripe, config name: ${config.name}`,
        enabled_events: supportedStripeEvents,
        metadata: {
          saleorAppConfigurationId: config.configurationId,
        },
        api_version: STRIPE_API_VERSION,
      });

      const { secret, id } = result;

      this.logger.info("Successfully created Stripe webhook", { id });

      if (!secret) {
        /**
         * According to docs, secret is optional, because it's only returned on creation.
         * Here we create it, so it must be there
         * If not, this is Panic
         */
        throw new InvalidDataError(
          "Stripe did not return secret from webhook. This should not happen",
        );
      }

      return ok({ secret, id });
    } catch (e) {
      this.logger.warn("Error creating webhook", { error: e });

      if (e instanceof InvalidDataError) {
        captureException(e);

        return err(new CantCreateWebhookError("Result from Stripe was unexpected"));
      }

      // todo handle exact errors
      return err(
        new CantCreateWebhookError("Error creating webhook", {
          cause: e,
        }),
      );
    }
  }
}
