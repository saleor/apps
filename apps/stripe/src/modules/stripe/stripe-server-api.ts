import { ResultAsync } from "neverthrow";
import Stripe from "stripe";

import { env } from "@/lib/env";
import { BaseError } from "@/lib/errors";
import { StripeSecretKey } from "@/modules/stripe/stripe-secret-key";
import pkg from "@/package.json";

export class StripeServerApi {
  private static stripeWebhookEnabledEvents: Stripe.WebhookEndpointCreateParams.EnabledEvent[] = [
    "payment_intent.created",
    "payment_intent.canceled",
    "payment_intent.succeeded",
    "payment_intent.processing",
    "payment_intent.payment_failed",
    "payment_intent.requires_action",
    "payment_intent.partially_funded",
    "payment_intent.amount_capturable_updated",
    "charge.refund.updated",
    "charge.refunded",
  ];
  static CreateAppWebhookError = BaseError.subclass("CreateAppWebhookError");
  static DeleteAppWebhookError = BaseError.subclass("DeleteAppWebhookError");
  static GetAppWebhookError = BaseError.subclass("GetAppWebhookError");
  static PingPaymentIntentsError = BaseError.subclass("PingPaymentIntentsError");
  static CreatePaymentIntentError = BaseError.subclass("CreatePaymentIntentError");

  private constructor(
    private deps: {
      stripeApiWrapper: Pick<Stripe, "webhookEndpoints" | "paymentIntents">;
    },
  ) {}

  static createFromKey(args: { key: StripeSecretKey }) {
    const stripeApiWrapper = new Stripe(args.key.getKeyValue(), {
      typescript: true,
      httpClient: Stripe.createFetchHttpClient(fetch), // this allow us to mock the fetch
      appInfo: {
        name: "Saleor App Payment Stripe",
        version: pkg.version,
        url: "https://apps.saleor.io/apps/stripe",
        partner_id: env.STRIPE_PARTNER_ID,
      },
    });

    return new StripeServerApi({ stripeApiWrapper });
  }

  createAppWebhook(args: { webhookUrl: string }) {
    return ResultAsync.fromPromise(
      this.deps.stripeApiWrapper.webhookEndpoints.create({
        url: args.webhookUrl,
        enabled_events: StripeServerApi.stripeWebhookEnabledEvents,
        description: "Saleor App Payment Stripe Webhook",
      }),
      (error) =>
        new StripeServerApi.CreateAppWebhookError("Failed to create app webhook", {
          cause: error,
        }),
    );
  }

  deleteAppWebhook(args: { webhookId: string }) {
    return ResultAsync.fromPromise(
      this.deps.stripeApiWrapper.webhookEndpoints.del(args.webhookId),
      (error) =>
        new StripeServerApi.DeleteAppWebhookError("Failed to delete app webhook", {
          cause: error,
        }),
    );
  }

  getAppWebhook(args: { webhookId: string }) {
    return ResultAsync.fromPromise(
      this.deps.stripeApiWrapper.webhookEndpoints.retrieve(args.webhookId),
      (error) =>
        new StripeServerApi.GetAppWebhookError("Failed to get app webhook", { cause: error }),
    );
  }

  pingPaymentIntents() {
    return ResultAsync.fromPromise(
      this.deps.stripeApiWrapper.paymentIntents.list({ limit: 1 }),
      (error) =>
        new StripeServerApi.PingPaymentIntentsError("Failed to ping payment intents", {
          cause: error,
        }),
    );
  }

  createPaymentIntent(args: { params: Stripe.PaymentIntentCreateParams }) {
    return ResultAsync.fromPromise(
      this.deps.stripeApiWrapper.paymentIntents.create(args.params),
      (error) =>
        new StripeServerApi.CreatePaymentIntentError("Failed to create payment intent", {
          cause: error,
        }),
    );
  }
}
