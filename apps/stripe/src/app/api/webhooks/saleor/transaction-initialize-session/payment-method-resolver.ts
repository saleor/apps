import { assertUnreachable } from "@/lib/assert-unreachable";
import { ApplePayPaymentMethod } from "@/modules/stripe/payment-methods/apple-pay";
import { CardPaymentMethod } from "@/modules/stripe/payment-methods/card";
import { GooglePayPaymentMethod } from "@/modules/stripe/payment-methods/google-pay";
import { IdealPaymentMethod } from "@/modules/stripe/payment-methods/ideal";
import { KlarnaPaymentMethod } from "@/modules/stripe/payment-methods/klarna";
import { PayPalPaymentMethod } from "@/modules/stripe/payment-methods/paypal";
import { SepaDebitPaymentMethod } from "@/modules/stripe/payment-methods/sepa-debit";
import { USBankAccountPaymentMethod } from "@/modules/stripe/payment-methods/us-bank-account";

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
    case "us_bank_account":
      return new USBankAccountPaymentMethod();
    case "sepa_debit":
      return new SepaDebitPaymentMethod();
    default:
      assertUnreachable(eventData.paymentIntent);
  }
};
