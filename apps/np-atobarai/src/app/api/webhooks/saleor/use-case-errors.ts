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

export const AtobaraiMultipleFailureTransactionErrorPublicCode =
  "AtobaraiMultipleFailureTransactionError" as const;

export const AtobaraiMultipleFailureTransactionError = BaseError.subclass(
  "AtobaraiMultipleFailureTransactionError",
  {
    props: {
      _brand: "AtobaraiMultipleFailureTransactionError" as const,
      publicCode: AtobaraiMultipleFailureTransactionErrorPublicCode,
      publicMessage: "Atobarai returned multiple transactions",
    },
  },
);

export type UseCaseErrors = InstanceType<
  typeof AtobaraiFailureTransactionError | typeof AtobaraiMultipleFailureTransactionError
>;
