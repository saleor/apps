import { BaseError } from "@saleor/errors";

export const AtobaraiFailureTransactionErrorPublicCode = "AtobaraiFailureTransactionError" as const;

export const AtobaraiFailureTransactionError = BaseError.subclass(
  "AtobaraiFailureTransactionError",
  {
    props: {
      _brand: "AtobaraiFailureTransactionError" as const,
      publicCode: AtobaraiFailureTransactionErrorPublicCode,
      publicMessage: "Atobarai returned failed transaction",
    },
  },
);

export const PayloadValidationErrorPublicCode = "PayloadValidationError" as const;

export const PayloadValidationError = BaseError.subclass("PayloadValidationError", {
  props: {
    _brand: "PayloadValidationError" as const,
    publicCode: PayloadValidationErrorPublicCode,
    publicMessage: "Failed to prepare transaction payload",
  },
});

export type UseCaseErrors =
  | InstanceType<typeof AtobaraiFailureTransactionError>
  | InstanceType<typeof PayloadValidationError>;
