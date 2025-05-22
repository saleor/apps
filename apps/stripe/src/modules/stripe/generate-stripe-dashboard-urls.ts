import { captureException } from "@sentry/nextjs";

import { BaseError } from "@/lib/errors";
import { StripeEnv } from "@/modules/stripe/stripe-env";
import { StripePaymentIntentId } from "@/modules/stripe/stripe-payment-intent-id";

import { StripeRefundId } from "./stripe-refund-id";

export const generatePaymentIntentStripeDashboardUrl = (
  paymentIntentId: StripePaymentIntentId,
  stripeEnv: StripeEnv | null,
) => {
  if (!stripeEnv) {
    captureException(new BaseError("Stripe env is null, it should not happen"));

    return undefined;
  }

  switch (stripeEnv) {
    case "LIVE":
      return `https://dashboard.stripe.com/payments/${encodeURIComponent(paymentIntentId)}`;
    case "TEST":
      return `https://dashboard.stripe.com/test/payments/${encodeURIComponent(paymentIntentId)}`;
  }
};

export const generateRefundStripeDashboardUrl = (
  refundId: StripeRefundId,
  stripeEnv: StripeEnv,
) => {
  switch (stripeEnv) {
    case "LIVE":
      return `https://dashboard.stripe.com/refunds/${encodeURIComponent(refundId)}`;
    case "TEST":
      return `https://dashboard.stripe.com/test/refunds/${encodeURIComponent(refundId)}`;
  }
};
