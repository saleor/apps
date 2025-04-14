import { err, ok } from "neverthrow";
import { z } from "zod";

import { BaseError } from "@/lib/errors";

const CardPaymentMethodSchema = z
  .object({
    paymentMethod: z.literal("card"),
  })
  .strict();

const TransactionInitalizeRequestDataSchema = z
  .object({
    paymentIntent: z.discriminatedUnion("paymentMethod", [CardPaymentMethodSchema]),
  })
  .brand("TransactionInitalizeRequestData");

export const ParseError = BaseError.subclass("ParseError", {
  props: {
    _internalName: "TransactionInitalizeSesssionDataParseErrorError" as const,
  },
});

export const UnsupportedPaymentMethodError = ParseError.subclass("UnsupportedPaymentMethodError", {
  props: {
    _internalName: "TransactionInitalizeSesssionDataUnsupportedPaymentMethodError" as const,
  },
});

export const parseTransactionInitalizeSessionRequestData = (raw: unknown) => {
  const parsingResult = TransactionInitalizeRequestDataSchema.safeParse(raw);

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

export type TransactionInitalizeRequestData = z.infer<typeof TransactionInitalizeRequestDataSchema>;

export type TransactionInitalizeRequestDataError =
  | InstanceType<typeof ParseError>
  | InstanceType<typeof UnsupportedPaymentMethodError>;
