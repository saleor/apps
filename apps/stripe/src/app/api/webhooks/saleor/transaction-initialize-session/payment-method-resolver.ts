import { assertUnreachable } from "@/lib/assert-unreachable";
import { ApplePayPaymentMethod } from "@/modules/stripe/payment-methods/apple-pay";
import { CardPaymentMethod } from "@/modules/stripe/payment-methods/card";
import { GooglePayPaymentMethod } from "@/modules/stripe/payment-methods/google-pay";
import { IdealPaymentMethod } from "@/modules/stripe/payment-methods/ideal";
import { KlarnaPaymentMethod } from "@/modules/stripe/payment-methods/klarna";
import { PayPalPaymentMethod } from "@/modules/stripe/payment-methods/paypal";

import { TransactionInitializeSessionEventData } from "./event-data-parser";

export const resolvePaymentMethodFromEventData = (
  eventData: TransactionInitializeSessionEventData,
) => {
  switch (eventData.paymentIntent.paymentMethod) {
    case "card":
      return new CardPaymentMethod();
    case "klarna":
      return new KlarnaPaymentMethod();
    case "google_pay":
      return new GooglePayPaymentMethod();
    case "apple_pay":
      return new ApplePayPaymentMethod();
    case "paypal":
      return new PayPalPaymentMethod();
    case "ideal":
      return new IdealPaymentMethod();
    default:
      assertUnreachable(eventData.paymentIntent);
  }
};
