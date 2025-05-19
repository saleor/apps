import { assertUnreachable } from "@/lib/assert-unreachable";
import { ApplePayPaymentMethod } from "@/modules/stripe/payment-methods/apple-pay";
import { CardPaymentMethod } from "@/modules/stripe/payment-methods/card";
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
    case "apple_pay":
      return new ApplePayPaymentMethod();
    case "paypal":
      return new PayPalPaymentMethod();
    default:
      assertUnreachable(eventData.paymentIntent);
  }
};
