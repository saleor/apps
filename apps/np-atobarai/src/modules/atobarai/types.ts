import { Result } from "neverthrow";

import { BaseError } from "@/lib/errors";

import { AtobaraiRegisterTransactionPayload } from "./atobarai-register-transaction-payload";
import { AtobaraiTransaction } from "./atobarai-transaction";

export type AtobaraiApiErrors = InstanceType<typeof AtobaraiApiClientRegisterTransactionError>;

export interface IAtobaraiApiClient {
  registerTransaction: (
    payload: AtobaraiRegisterTransactionPayload,
  ) => Promise<Result<AtobaraiTransaction, AtobaraiApiErrors>>;
}

export const AtobaraiApiClientRegisterTransactionError = BaseError.subclass(
  "AtobaraiApiClientRegisterTransactionError",
  {
    props: {
      __brand: "AtobaraiApiClientRegisterTransactionError",
    },
  },
);
