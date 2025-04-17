import Stripe from "stripe";

export const createDateFromStripeEvent = (event: Stripe.Event): Date =>
  new Date(event.created * 1000);
