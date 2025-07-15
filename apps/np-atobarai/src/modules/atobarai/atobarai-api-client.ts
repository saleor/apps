import { BaseError } from "@saleor/errors";
import { err, ok, Result, ResultAsync } from "neverthrow";

import { AtobaraiMerchantCode } from "./atobarai-merchant-code";
import { createAtobaraiRegisterTransactionErrorResponse } from "./atobarai-register-transaction-error-response";
import { AtobaraiRegisterTransactionPayload } from "./atobarai-register-transaction-payload";
import {
  AtobaraiRegisterTransactionSuccessResponse,
  createAtobaraiRegisterTransactionSuccessResponse,
} from "./atobarai-register-transaction-success-response";
import { AtobaraiSpCode } from "./atobarai-sp-code";
import { AtobaraiTerminalId } from "./atobarai-terminal-id";
import {
  AtobaraiApiClientRegisterTransactionError,
  AtobaraiApiErrors,
  AtobaraiEnviroment,
  IAtobaraiApiClient,
} from "./types";

export class AtobaraiApiClient implements IAtobaraiApiClient {
  private atobaraiTerminalId: AtobaraiTerminalId;
  private atobaraiMerchantCode: AtobaraiMerchantCode;
  private atobaraiSpCode: AtobaraiSpCode;
  private atobaraiEnviroment: AtobaraiEnviroment;

  private constructor(args: {
    atobaraiTerminalId: AtobaraiTerminalId;
    atobaraiMerchantCode: AtobaraiMerchantCode;
    atobaraiSpCode: AtobaraiSpCode;
    atobaraiEnviroment: AtobaraiEnviroment;
  }) {
    this.atobaraiTerminalId = args.atobaraiTerminalId;
    this.atobaraiMerchantCode = args.atobaraiMerchantCode;
    this.atobaraiSpCode = args.atobaraiSpCode;
    this.atobaraiEnviroment = args.atobaraiEnviroment;
  }

  static create(args: {
    atobaraiTerminalId: AtobaraiTerminalId;
    atobaraiMerchantCode: AtobaraiMerchantCode;
    atobaraiSpCode: AtobaraiSpCode;
    atobaraiEnviroment: AtobaraiEnviroment;
  }): IAtobaraiApiClient {
    return new AtobaraiApiClient({
      atobaraiTerminalId: args.atobaraiTerminalId,
      atobaraiMerchantCode: args.atobaraiMerchantCode,
      atobaraiSpCode: args.atobaraiSpCode,
      atobaraiEnviroment: args.atobaraiEnviroment,
    });
  }

  private getHeaders(): HeadersInit {
    return {
      "X-NP-Terminal-Id": this.atobaraiTerminalId,
      Authorization: `Basic ${btoa(`${this.atobaraiMerchantCode}:${this.atobaraiSpCode}`)}`,
      "Content-Type": "application/json",
    };
  }

  private getBaseUrl() {
    return this.atobaraiEnviroment === "sandbox"
      ? "https://ctcp.np-payment-gateway.com/v1/"
      : "https://cp.np-payment-gateway.com/v1/";
  }

  async registerTransaction(
    payload: AtobaraiRegisterTransactionPayload,
  ): Promise<Result<AtobaraiRegisterTransactionSuccessResponse, AtobaraiApiErrors>> {
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

    if (!result.value.ok) {
      const response = await result.value.json();

      const { errors } = createAtobaraiRegisterTransactionErrorResponse(response);

      return err(
        new AtobaraiApiClientRegisterTransactionError("Atobarai API returned an error", {
          errors: [errors.flatMap((error) => error.codes.map((code) => new BaseError(code)))],
        }),
      );
    }

    const response = await result.value.json();

    return ok(createAtobaraiRegisterTransactionSuccessResponse(response));
  }
}
