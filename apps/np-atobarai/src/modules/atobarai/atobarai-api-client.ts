import { BaseError } from "@saleor/errors";
import { err, ok, Result, ResultAsync } from "neverthrow";

import { AtobaraiMerchantCode } from "./atobarai-merchant-code";
import { AtobaraiRegisterTransactionPayload } from "./atobarai-register-transaction-payload";
import { AtobaraiSpCode } from "./atobarai-sp-code";
import { AtobaraiTerminalId } from "./atobarai-terminal-id";
import { AtobaraiTransaction } from "./atobarai-transaction";
import {
  AtobaraiApiClientRegisterTransactionError,
  AtobaraiApiClientValidationError,
  AtobaraiApiErrors,
  AtobaraiEnvironment,
  IAtobaraiApiClient,
} from "./types";

export class AtobaraiApiClient implements IAtobaraiApiClient {
  private atobaraiTerminalId: AtobaraiTerminalId;
  private atobaraiMerchantCode: AtobaraiMerchantCode;
  private atobaraiSpCode: AtobaraiSpCode;
  private atobaraiEnvironment: AtobaraiEnvironment;

  private constructor(args: {
    atobaraiTerminalId: AtobaraiTerminalId;
    atobaraiMerchantCode: AtobaraiMerchantCode;
    atobaraiSpCode: AtobaraiSpCode;
    atobaraiEnvironment: AtobaraiEnvironment;
  }) {
    this.atobaraiTerminalId = args.atobaraiTerminalId;
    this.atobaraiMerchantCode = args.atobaraiMerchantCode;
    this.atobaraiSpCode = args.atobaraiSpCode;
    this.atobaraiEnvironment = args.atobaraiEnvironment;
  }

  static create(args: {
    atobaraiTerminalId: AtobaraiTerminalId;
    atobaraiMerchantCode: AtobaraiMerchantCode;
    atobaraiSpCode: AtobaraiSpCode;
    atobaraiEnvironment: AtobaraiEnvironment;
  }): IAtobaraiApiClient {
    return new AtobaraiApiClient({
      atobaraiTerminalId: args.atobaraiTerminalId,
      atobaraiMerchantCode: args.atobaraiMerchantCode,
      atobaraiSpCode: args.atobaraiSpCode,
      atobaraiEnvironment: args.atobaraiEnvironment,
    });
  }

  private getHeaders(): HeadersInit {
    return {
      "X-NP-Terminal-Id": this.atobaraiTerminalId,
      Authorization: `Basic ${btoa(`${this.atobaraiMerchantCode}:${this.atobaraiSpCode}`)}`,
    };
  }

  private getBaseUrl() {
    return this.atobaraiEnvironment === "sandbox"
      ? "https://ctcp.np-payment-gateway.com/v1/"
      : "https://cp.np-payment-gateway.com/v1/";
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

  async verifyCredentials(): Promise<
    Result<null, InstanceType<typeof AtobaraiApiClientValidationError>>
  > {
    const requestUrl = new URL("authorizations/find", this.getBaseUrl());

    const result = await ResultAsync.fromPromise(
      fetch(requestUrl, {
        method: "POST",
        headers: {
          ...this.getHeaders(),
          "content-type": "application/json",
          "accept-type": "application/json",
        },
      }),
      (error) => AtobaraiApiClientValidationError.normalize(error),
    );

    console.log(result);

    if (result.isErr()) {
      return err(AtobaraiApiClientValidationError.normalize(result.error));
    }

    if (result.value.status !== 200) {
      return err(
        new AtobaraiApiClientValidationError("Invalid credentials", {
          cause: new Error(`Received status code ${result.value.status}`),
        }),
      );
    }

    return ok(null);
  }
}
