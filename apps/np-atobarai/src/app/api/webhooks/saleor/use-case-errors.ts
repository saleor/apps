import { BaseError } from "@saleor/errors";

export const AtobaraiFailureTransactionErrorPublicCode = "AtobaraiFailureTransactionError" as const;
export const InvalidEventValidationErrorPublicCode = "InvalidEventValidationError" as const;

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

export const InvalidEventValidationError = BaseError.subclass("InvalidEventValidationError", {
  props: {
    _brand: "InvalidEventValidationError" as const,
    publicCode: InvalidEventValidationErrorPublicCode,
    publicMessage:
      "Event payload provided to app is invalid. Verify customer details and configuration",
  },
});

export type UseCaseErrors = InstanceType<
  typeof AtobaraiFailureTransactionError | typeof InvalidEventValidationError
>;
