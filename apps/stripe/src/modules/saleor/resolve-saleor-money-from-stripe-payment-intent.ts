import { Result } from "neverthrow";

import { createStripePaymentIntentStatus } from "../stripe/stripe-payment-intent-status";
import { SaleorMoney } from "./saleor-money";

export const resolveSaleorMoneyFromStripePaymentIntent = (paymentIntent: {
  amount: number;
  amount_received: number;
  amount_capturable: number;
  currency: string;
  status: string;
}): Result<SaleorMoney, InstanceType<typeof SaleorMoney.ValidationError>> => {
  const stripePaymentIntentStatus = createStripePaymentIntentStatus(paymentIntent.status);

  switch (stripePaymentIntentStatus) {
    case "canceled":
    case "requires_payment_method":
    case "requires_action":
      return SaleorMoney.createFromStripe({
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
      });
    case "requires_capture":
      return SaleorMoney.createFromStripe({
        amount: paymentIntent.amount_capturable,
        currency: paymentIntent.currency,
      });
    default:
      return SaleorMoney.createFromStripe({
        amount: paymentIntent.amount_received,
        currency: paymentIntent.currency,
      });
  }
};
