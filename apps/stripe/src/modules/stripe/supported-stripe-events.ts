import type { Stripe } from "stripe";

export const supportedStripeEvents: Array<Stripe.WebhookEndpointCreateParams.EnabledEvent> = [
  "payment_intent.succeeded",
  "payment_intent.amount_capturable_updated",
];

// todo make exhaustive check in stripe webhook to ensure we handle all
