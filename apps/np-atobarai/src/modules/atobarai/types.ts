import { BaseError } from "@saleor/errors";
import { Result } from "neverthrow";

import { AtobaraiMerchantCode } from "./atobarai-merchant-code";
import { AtobaraiRegisterTransactionPayload } from "./atobarai-register-transaction-payload";
import { AtobaraiSpCode } from "./atobarai-sp-code";
import { AtobaraiTerminalId } from "./atobarai-terminal-id";
import { AtobaraiTransaction } from "./atobarai-transaction";

export type AtobaraiApiErrors = InstanceType<
  typeof AtobaraiApiClientRegisterTransactionError | typeof AtobaraiApiClientValidationError
>;

export type AtobaraiEnvironment = "sandbox" | "production";

export interface IAtobaraiApiClientFactory {
  create(args: {
    atobaraiTerminalId: AtobaraiTerminalId;
    atobaraiMerchantCode: AtobaraiMerchantCode;
    atobaraiSpCode: AtobaraiSpCode;
    atobaraiEnvironment: AtobaraiEnvironment;
  }): IAtobaraiApiClient;
}

export interface IAtobaraiApiClient {
  registerTransaction: (
    payload: AtobaraiRegisterTransactionPayload,
  ) => Promise<Result<AtobaraiTransaction, AtobaraiApiErrors>>;

  verifyCredentials: () => Promise<
    Result<null, InstanceType<typeof AtobaraiApiClientValidationError>>
  >;
}

export const AtobaraiApiClientRegisterTransactionError = BaseError.subclass(
  "AtobaraiApiClientRegisterTransactionError",
  {
    props: {
      __brand: "AtobaraiApiClientRegisterTransactionError",
    },
  },
);

export const AtobaraiApiClientValidationError = BaseError.subclass(
  "AtobaraiApiClientValidationError",
  {
    props: {
      __brand: "AtobaraiApiClientValidationError",
    },
  },
);
