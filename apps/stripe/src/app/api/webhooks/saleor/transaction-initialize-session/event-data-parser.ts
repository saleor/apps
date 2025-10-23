import { err, ok } from "neverthrow";
import { z } from "zod";

import { BaseError } from "@/lib/errors";
import { ApplePayPaymentMethod } from "@/modules/stripe/payment-methods/apple-pay";
import { CardPaymentMethod } from "@/modules/stripe/payment-methods/card";
import { GooglePayPaymentMethod } from "@/modules/stripe/payment-methods/google-pay";
import { IdealPaymentMethod } from "@/modules/stripe/payment-methods/ideal";
import { KlarnaPaymentMethod } from "@/modules/stripe/payment-methods/klarna";
import { PayPalPaymentMethod } from "@/modules/stripe/payment-methods/paypal";
import { SepaDebitPaymentMethod } from "@/modules/stripe/payment-methods/sepa-debit";
import { USBankAccountPaymentMethod } from "@/modules/stripe/payment-methods/us-bank-account";

const TransactionInitializeEventDataSchema = z
  .object({
    paymentIntent: z.discriminatedUnion("paymentMethod", [
      CardPaymentMethod.TransactionInitializeSchema,
      KlarnaPaymentMethod.TransactionInitializeSchema,
      GooglePayPaymentMethod.TransactionInitializeSchema,
      ApplePayPaymentMethod.TransactionInitializeSchema,
      PayPalPaymentMethod.TransactionInitializeSchema,
      IdealPaymentMethod.TransactionInitializeSchema,
      USBankAccountPaymentMethod.TransactionInitializeSchema,
      SepaDebitPaymentMethod.TransactionInitializeSchema,
    ]),
  })
  .strict()
  .brand("TransactionInitializeRequestData");

export const ParseErrorPublicCode = "ParseError" as const;
export const UnsupportedPaymentMethodErrorPublicCode = "UnsupportedPaymentMethodError" as const;

export const ParseError = BaseError.subclass("ParseError", {
  props: {
    _internalName: "TransactionInitializeEventDataParseError" as const,
    publicCode: ParseErrorPublicCode,
    publicMessage:
      "Provided data is invalid. Check your data argument to transactionInitializeSession mutation and try again.",
    merchantMessage: "Payment intent not created - storefront sent invalid data",
  },
});

export const UnsupportedPaymentMethodError = ParseError.subclass("UnsupportedPaymentMethodError", {
  props: {
    _internalName: "TransactionInitializeEventDataUnsupportedPaymentMethodError" as const,
    publicCode: UnsupportedPaymentMethodErrorPublicCode,
    publicMessage: "Provided payment method is not supported",
    merchantMessage: "Payment intent not created - provided payment method is not supported",
  },
});

export const parseTransactionInitializeSessionEventData = (raw: unknown) => {
  const parsingResult = TransactionInitializeEventDataSchema.safeParse(raw);

  if (parsingResult.success) {
    return ok(parsingResult.data);
  }

  const hasInvalidUnionDiscriminator = parsingResult.error.issues.some(
    (issue) => issue.code === "invalid_union_discriminator",
  );

  if (hasInvalidUnionDiscriminator) {
    return err(
      // todo print payment method from the frontend
      new UnsupportedPaymentMethodError("Payment method is not supported", {
        cause: parsingResult.error,
        props: { data: raw },
      }),
    );
  }

  return err(new ParseError("Invalid data", { cause: parsingResult.error }));
};

export type TransactionInitializeSessionEventData = z.infer<
  typeof TransactionInitializeEventDataSchema
>;

export type TransactionInitializeSessionEventDataError =
  | InstanceType<typeof ParseError>
  | InstanceType<typeof UnsupportedPaymentMethodError>;
