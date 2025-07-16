import { BaseError } from "@saleor/errors";

export const AtobaraiFailureTransactionErrorPublicCode = "AtobaraiFailureTransactionError" as const;

export const AtobaraiFailureTransactionError = BaseError.subclass(
  "AtobaraiFailureTransactionError",
  {
    props: {
      _brand: "AtobaraiFailureTransactionError",
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
      _brand: "AtobaraiMultipleFailureTransactionError",
      publicCode: AtobaraiMultipleFailureTransactionErrorPublicCode,
      publicMessage: "Atobarai returned multiple transactions",
    },
  },
);

export type TransactionInitializeSessionUseCaseErrors = InstanceType<
  typeof AtobaraiFailureTransactionError | typeof AtobaraiMultipleFailureTransactionError
>;
