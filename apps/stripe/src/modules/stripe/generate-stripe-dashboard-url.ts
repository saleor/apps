import { StripeEnv } from "@/modules/stripe/stripe-env";
import { StripePaymentIntentId } from "@/modules/stripe/stripe-payment-intent-id";

export const generateStripeDashboardUrl = (
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
