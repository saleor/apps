import { assertUnreachable } from "@/lib/assert-unreachable";
import { CardPaymentMethod } from "@/modules/stripe/payment-methods/card";
import { KlarnaPaymentMethod } from "@/modules/stripe/payment-methods/klarna";

import { TransactionInitializeSessionEventData } from "./event-data-parser";

export const resolvePaymentMethodFromEventData = (
  eventData: TransactionInitializeSessionEventData,
) => {
  switch (eventData.paymentIntent.paymentMethod) {
    case "card":
      return new CardPaymentMethod();
    case "klarna":
      return new KlarnaPaymentMethod();
    default:
      assertUnreachable(eventData.paymentIntent.paymentMethod);
  }
};
