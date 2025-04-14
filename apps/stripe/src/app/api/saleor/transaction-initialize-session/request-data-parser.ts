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

export const ValidationError = BaseError.subclass("ValidationError", {
  props: {
    _internalName: "TransactionInitalizeSesssionDataValidationError" as const,
  },
});

export const UnsupportedPaymentMethodError = ValidationError.subclass(
  "UnsupportedPaymentMethodError",
  {
    props: {
      _internalName: "TransactionInitalizeSesssionDataUnsupportedPaymentMethodError" as const,
    },
  },
);

export const createFromTransactionInitalizeSessionData = (raw: unknown) => {
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

  return err(new ValidationError("Invalid data", { cause: parsingResult.error }));
};

export type TransactionInitalizeRequestData = z.infer<typeof TransactionInitalizeRequestDataSchema>;

export type TransactionInitalizeRequestDataError =
  | InstanceType<typeof ValidationError>
  | InstanceType<typeof UnsupportedPaymentMethodError>;

export class TransactionInitalizeSessionDataParserRequestDataParser {}
