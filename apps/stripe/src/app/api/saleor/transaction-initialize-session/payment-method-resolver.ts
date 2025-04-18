import { assertUnreachable } from "@/lib/assert-unreachable";
import { CardPaymentMethod } from "@/modules/stripe/payment-methods/card";

import { TransactionInitializeSessionEventData } from "./event-data-parser";

export const resolvePaymentMethodFromEventData = (
  eventData: TransactionInitializeSessionEventData,
) => {
  switch (eventData.paymentIntent.paymentMethod) {
    case "card":
      return new CardPaymentMethod();
    default:
      assertUnreachable(eventData.paymentIntent.paymentMethod);
  }
};
