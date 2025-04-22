import { err, ok } from "neverthrow";

import { WebhookParams } from "@/app/api/stripe/webhook/webhook-params";
import { BaseError } from "@/lib/errors";

/**
 * Builds URL which Stripe will reach
 *
 * Consider merging with WebhookParams, maybe it can be single class like StripeWebhookUrl
 */
export class StripeWebhookUrlBuilder {
  buildUrl({ appUrl, webhookParams }: { appUrl: string; webhookParams: WebhookParams }) {
    try {
      const webhookUrl = new URL(appUrl + "/api/stripe/webhook");

      webhookUrl.searchParams.set(
        WebhookParams.configurationIdIdSearchParam,
        webhookParams.configurationId,
      );
      webhookUrl.searchParams.set(
        WebhookParams.saleorApiUrlSearchParam,
        webhookParams.saleorApiUrl,
      );

      return ok(webhookUrl.toString());
    } catch (e) {
      return err(
        new BaseError("Cant build URL", {
          cause: e,
        }),
      );
    }
  }
}
