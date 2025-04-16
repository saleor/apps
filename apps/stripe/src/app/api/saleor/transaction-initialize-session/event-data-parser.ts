import { err, ok } from "neverthrow";
import { z } from "zod";

import { BaseError } from "@/lib/errors";

const CardPaymentMethodSchema = z
  .object({
    paymentMethod: z.literal("card"),
  })
  .strict();

const TransactionInitializeEventDataSchema = z
  .object({
    paymentIntent: z.discriminatedUnion("paymentMethod", [CardPaymentMethodSchema]),
  })
  .strict()
  .brand("TransactionInitializeRequestData");

export const ParseError = BaseError.subclass("ParseError", {
  props: {
    _internalName: "TransactionInitializeEventDataParseError" as const,
    publicCode: "BadRequestError" as const,
    publicMessage:
      "Provided data is invalid. Check your data argument to transactionInitializeSession mutation and try again.",
  },
});

export const UnsupportedPaymentMethodError = ParseError.subclass("UnsupportedPaymentMethodError", {
  props: {
    _internalName: "TransactionInitializeEventDataUnsupportedPaymentMethodError" as const,
    publicCode: "UnsupportedPaymentMethodError" as const,
    publicMessage: "Provided payment method is not supported",
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
      new UnsupportedPaymentMethodError("Payment method is not supported", {
        cause: parsingResult.error,
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
