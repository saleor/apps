import { BaseError } from "@saleor/errors";
import { Result } from "neverthrow";

import { AtobaraiMerchantCode } from "./atobarai-merchant-code";
import { AtobaraiRegisterTransactionPayload } from "./atobarai-register-transaction-payload";
import { AtobaraiRegisterTransactionSuccessResponse } from "./atobarai-register-transaction-success-response";
import { AtobaraiSpCode } from "./atobarai-sp-code";
import { AtobaraiTerminalId } from "./atobarai-terminal-id";

export type AtobaraiApiErrors = InstanceType<
  typeof AtobaraiApiClientRegisterTransactionError | typeof AtobaraiApiClientValidationError
>;

export type AtobaraiEnviroment = "sandbox" | "production";

export interface IAtobaraiApiClientFactory {
  create(args: {
    atobaraiTerminalId: AtobaraiTerminalId;
    atobaraiMerchantCode: AtobaraiMerchantCode;
    atobaraiSpCode: AtobaraiSpCode;
    atobaraiEnviroment: AtobaraiEnviroment;
  }): IAtobaraiApiClient;
}

export interface IAtobaraiApiClient {
  registerTransaction: (
    payload: AtobaraiRegisterTransactionPayload,
  ) => Promise<Result<AtobaraiRegisterTransactionSuccessResponse, AtobaraiApiErrors>>;
  verifyCredentials: () => Promise<
    Result<null, InstanceType<typeof AtobaraiApiClientValidationError>>
  >;
}

export const AtobaraiApiClientRegisterTransactionErrorPublicCode =
  "AtobaraiRegisterTransactionError" as const;

export const AtobaraiApiClientRegisterTransactionError = BaseError.subclass(
  "AtobaraiApiClientRegisterTransactionError",
  {
    props: {
      _brand: "AtobaraiApiClientRegisterTransactionError",
      publicCode: AtobaraiApiClientRegisterTransactionErrorPublicCode,
      publicMessage: "Failed to register transaction with Atobarai",
    },
  },
);

export const AtobaraiApiClientValidationError = BaseError.subclass(
  "AtobaraiApiClientValidationError",
  {
    props: {
      _brand: "AtobaraiApiClientValidationError",
      publicCode: AtobaraiApiClientRegisterTransactionErrorPublicCode,
      publicMessage: "Failed to authenticate with Atobarai",
    },
  },
);
