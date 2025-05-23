import { StripeEnv } from "@/modules/stripe/stripe-env";
import { StripePaymentIntentId } from "@/modules/stripe/stripe-payment-intent-id";

import { StripeRefundId } from "./stripe-refund-id";

export const generatePaymentIntentStripeDashboardUrl = (
  paymentIntentId: StripePaymentIntentId,
  stripeEnv: StripeEnv,
) => {
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
