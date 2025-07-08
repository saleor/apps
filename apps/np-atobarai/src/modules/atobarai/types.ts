import { Result } from "neverthrow";

import { BaseError } from "@/lib/errors";

import { AtobaraiMerchantCode } from "./atobarai-merchant-code";
import { AtobaraiRegisterTransactionPayload } from "./atobarai-register-transaction-payload";
import { AtobaraiSpCode } from "./atobarai-sp-code";
import { AtobaraiTerminalId } from "./atobarai-terminal-id";
import { AtobaraiTransaction } from "./atobarai-transaction";

export type AtobaraiApiErrors = InstanceType<typeof AtobaraiApiClientRegisterTransactionError>;

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
