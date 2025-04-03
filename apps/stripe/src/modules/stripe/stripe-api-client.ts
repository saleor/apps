import { ResultAsync } from "neverthrow";
import Stripe from "stripe";

import { BaseError } from "@/lib/errors";
import pkg from "@/package.json";

export class StripeApiClient {
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
  static PingTokensCreateError = BaseError.subclass("PingTokensCreateError");
  static CreatePaymentIntentError = BaseError.subclass("CreatePaymentIntentError");

  private constructor(
    private deps: {
      stripeApiWrapper: Pick<Stripe, "webhookEndpoints" | "paymentIntents" | "tokens">;
    },
  ) {}

  static createFromKey(args: { key: string }) {
    const stripeApiWrapper = new Stripe(args.key, {
      typescript: true,
      httpClient: Stripe.createFetchHttpClient(fetch), // this allow us to mock the fetch
      appInfo: {
        name: "Saleor App Payment Stripe",
        version: pkg.version,
        // TOOD: add url / partner_id - https://docs.stripe.com/building-plugins?lang=node#setappinfo
      },
    });

    return new StripeApiClient({ stripeApiWrapper });
  }

  createAppWebhook(args: { webhookUrl: string }) {
    return ResultAsync.fromPromise(
      this.deps.stripeApiWrapper.webhookEndpoints.create({
        url: args.webhookUrl,
        enabled_events: StripeApiClient.stripeWebhookEnabledEvents,
        description: "Saleor App Payment Stripe Webhook",
      }),
      (error) =>
        new StripeApiClient.CreateAppWebhookError("Failed to create app webhook", { cause: error }),
    );
  }

  deleteAppWebhook(args: { webhookId: string }) {
    return ResultAsync.fromPromise(
      this.deps.stripeApiWrapper.webhookEndpoints.del(args.webhookId),
      (error) =>
        new StripeApiClient.DeleteAppWebhookError("Failed to delete app webhook", { cause: error }),
    );
  }

  getAppWebhook(args: { webhookId: string }) {
    return ResultAsync.fromPromise(
      this.deps.stripeApiWrapper.webhookEndpoints.retrieve(args.webhookId),
      (error) =>
        new StripeApiClient.GetAppWebhookError("Failed to get app webhook", { cause: error }),
    );
  }

  pingPaymentIntents() {
    return ResultAsync.fromPromise(
      this.deps.stripeApiWrapper.paymentIntents.list({ limit: 1 }),
      (error) =>
        new StripeApiClient.PingPaymentIntentsError("Failed to ping payment intents", {
          cause: error,
        }),
    );
  }

  pingTokensCreate() {
    return ResultAsync.fromPromise(
      this.deps.stripeApiWrapper.tokens.create({
        pii: { id_number: "test" },
      }),
      (error) =>
        new StripeApiClient.PingTokensCreateError("Failed to ping tokens create", {
          cause: error,
        }),
    );
  }

  createPaymentIntent(args: { params: Stripe.PaymentIntentCreateParams }) {
    return ResultAsync.fromPromise(
      this.deps.stripeApiWrapper.paymentIntents.create(args.params),
      (error) =>
        new StripeApiClient.CreatePaymentIntentError("Failed to create payment intent", {
          cause: error,
        }),
    );
  }
}
