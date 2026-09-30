import { assertUnreachable } from "@/lib/assert-unreachable";
import { ApplePayPaymentMethod } from "@/modules/stripe/payment-methods/apple-pay";
import { CardPaymentMethod } from "@/modules/stripe/payment-methods/card";
import { GooglePayPaymentMethod } from "@/modules/stripe/payment-methods/google-pay";
import { KlarnaPaymentMethod } from "@/modules/stripe/payment-methods/klarna";
import { LinkPaymentMethod } from "@/modules/stripe/payment-methods/link";
import { MobilePayPaymentMethod } from "@/modules/stripe/payment-methods/mobilepay";
import { PayByBankPaymentMethod } from "@/modules/stripe/payment-methods/pay-by-bank";
import { PayPalPaymentMethod } from "@/modules/stripe/payment-methods/paypal";
import { RevolutPayPaymentMethod } from "@/modules/stripe/payment-methods/revolut-pay";
import { SepaDebitPaymentMethod } from "@/modules/stripe/payment-methods/sepa-debit";
import { USBankAccountPaymentMethod } from "@/modules/stripe/payment-methods/us-bank-account";

import { type TransactionInitializeSessionEventData } from "./event-data-parser";

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
    case "us_bank_account":
      return new USBankAccountPaymentMethod();
    case "sepa_debit":
      return new SepaDebitPaymentMethod();
    case "link":
      return new LinkPaymentMethod();
    case "pay_by_bank":
      return new PayByBankPaymentMethod();
    case "mobilepay":
      return new MobilePayPaymentMethod();
    case "revolut_pay":
      return new RevolutPayPaymentMethod();
    default:
      assertUnreachable(eventData.paymentIntent);
  }
};
