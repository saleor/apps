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

export type UseCaseErrors = InstanceType<typeof AtobaraiFailureTransactionError>;
