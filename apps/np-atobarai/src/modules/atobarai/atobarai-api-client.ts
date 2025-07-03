import { err, ok, Result, ResultAsync } from "neverthrow";

import { BaseError } from "@/lib/errors";

import { AtobaraiMerchantCode } from "./atobarai-merchant-code";
import { AtobaraiRegisterTransactionPayload } from "./atobarai-register-transaction-payload";
import { AtobaraiSpCode } from "./atobarai-sp-code";
import { AtobaraiTerminalId } from "./atobarai-terminal-id";
import { AtobaraiTransaction } from "./atobarai-transaction";
import {
  AtobaraiApiClientRegisterTransactionError,
  AtobaraiApiErrors,
  IAtobaraiApiClient,
} from "./types";

export class AtobaraiApiClient implements IAtobaraiApiClient {
  private atobaraiTerminalId: AtobaraiTerminalId;
  private atobaraiMerchantCode: AtobaraiMerchantCode;
  private atobaraiSPCode: AtobaraiSpCode;
  private atobaraiEnviroment: "sandbox" | "production";

  private constructor(args: {
    atobaraiTerminalId: AtobaraiTerminalId;
    atobaraiMerchantCode: AtobaraiMerchantCode;
    atobaraiSPCode: AtobaraiSpCode;
    atobaraiEnviroment: "sandbox" | "production";
  }) {
    this.atobaraiTerminalId = args.atobaraiTerminalId;
    this.atobaraiMerchantCode = args.atobaraiMerchantCode;
    this.atobaraiSPCode = args.atobaraiSPCode;
    this.atobaraiEnviroment = args.atobaraiEnviroment;
  }

  private getHeaders(): HeadersInit {
    return {
      "X-NP-Terminal-Id": this.atobaraiTerminalId,
      Authorization: `Basic ${btoa(`${this.atobaraiMerchantCode}:${this.atobaraiSPCode}`)}`,
    };
  }

  private getBaseUrl() {
    return this.atobaraiEnviroment === "sandbox"
      ? "https://ctcp.np-payment-gateway.com/v1"
      : "https://cp.np-payment-gateway.com/v1";
  }

  async registerTransaction(
    payload: AtobaraiRegisterTransactionPayload,
  ): Promise<Result<AtobaraiTransaction, AtobaraiApiErrors>> {
    const requestUrl = new URL("transactions", this.getBaseUrl());

    const result = await ResultAsync.fromPromise(
      fetch(requestUrl, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      }),
      (error) => BaseError.normalize(error),
    );

    if (result.isErr()) {
      return err(
        new AtobaraiApiClientRegisterTransactionError("Failed to register transaction", {
          cause: result.error,
        }),
      );
    }

    return ok(new AtobaraiTransaction());
  }
}
