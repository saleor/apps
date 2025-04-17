import type { Stripe } from "stripe";

export const supportedStripeEvents: Array<Stripe.WebhookEndpointCreateParams.EnabledEvent> = [
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

// todo make exhaustive check in stripe webhook to ensure we handle all
