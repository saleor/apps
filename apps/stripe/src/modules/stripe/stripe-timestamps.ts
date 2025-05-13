import Stripe from "stripe";

import { createStripePaymentIntentStatus } from "./stripe-payment-intent-status";

const convertUnixTimestampToDate = (timestamp: number): Date => new Date(timestamp * 1000);

export const createTimestampFromStripeEvent = (event: Stripe.Event): Date =>
  convertUnixTimestampToDate(event.created);

export const createTimestampFromPaymentIntent = (
  paymentIntent: Stripe.PaymentIntent,
): Date | null => {
  const status = createStripePaymentIntentStatus(paymentIntent.status);

  if (status === "canceled" && paymentIntent.canceled_at) {
    return convertUnixTimestampToDate(paymentIntent.canceled_at);
  }

  // For other statuses, Stripe sends us the PaymentIntent created date - which don't use to avoid raporting events from the past instead of the current date of the webhook event
  return null;
};
