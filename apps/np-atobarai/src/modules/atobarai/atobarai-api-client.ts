import { BaseError } from "@saleor/errors";
import { err, ok, Result, ResultAsync } from "neverthrow";

import { AtobaraiChangeTransactionPayload } from "./atobarai-change-transaction-payload";
import { createAtobaraiErrorResponse } from "./atobarai-error-response";
import { AtobaraiMerchantCode } from "./atobarai-merchant-code";
import { AtobaraiRegisterTransactionPayload } from "./atobarai-register-transaction-payload";
import { AtobaraiSpCode } from "./atobarai-sp-code";
import { AtobaraiTerminalId } from "./atobarai-terminal-id";
import {
  AtobaraiTransactionSuccessResponse,
  createAtobaraiTransactionSuccessResponse,
} from "./atobarai-transaction-success-response";
import {
  AtobaraiApiChangeTransactionErrors,
  AtobaraiApiClientChangeTransactionError,
  AtobaraiApiClientRegisterTransactionError,
  AtobaraiApiClientValidationError,
  AtobaraiApiRegisterTransactionErrors,
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
      "Content-Type": "application/json",
    };
  }

  private getBaseUrl() {
    return this.atobaraiEnvironment === "sandbox"
      ? "https://ctcp.np-payment-gateway.com/v1/"
      : "https://cp.np-payment-gateway.com/v1/";
  }

  private convertErrorResponseToNormalizedErrors(
    response: unknown,
  ): InstanceType<typeof BaseError>[] {
    const { errors } = createAtobaraiErrorResponse(response);

    return errors.flatMap((error) => error.codes.map((code) => new BaseError(code)));
  }

  async registerTransaction(
    payload: AtobaraiRegisterTransactionPayload,
  ): Promise<Result<AtobaraiTransactionSuccessResponse, AtobaraiApiRegisterTransactionErrors>> {
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

      const errors = this.convertErrorResponseToNormalizedErrors(response);

      return err(
        new AtobaraiApiClientRegisterTransactionError("Atobarai API returned an error", {
          errors,
        }),
      );
    }

    const response = await result.value.json();

    return ok(createAtobaraiTransactionSuccessResponse(response));
  }

  async changeTransaction(
    payload: AtobaraiChangeTransactionPayload,
  ): Promise<Result<AtobaraiTransactionSuccessResponse, AtobaraiApiChangeTransactionErrors>> {
    const requestUrl = new URL("transactions/update", this.getBaseUrl());

    const result = await ResultAsync.fromPromise(
      fetch(requestUrl, {
        method: "PATCH",
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      }),
      (error) => BaseError.normalize(error),
    );

    if (result.isErr()) {
      return err(
        new AtobaraiApiClientChangeTransactionError("Failed to change transaction", {
          cause: result.error,
        }),
      );
    }

    if (!result.value.ok) {
      const response = await result.value.json();

      const errors = this.convertErrorResponseToNormalizedErrors(response);

      return err(
        new AtobaraiApiClientChangeTransactionError("Atobarai API returned an error", {
          errors,
        }),
      );
    }

    const response = await result.value.json();

    return ok(createAtobaraiTransactionSuccessResponse(response));
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
        },
        body: JSON.stringify({ transactions: [] }),
      }),
      (error) => AtobaraiApiClientValidationError.normalize(error),
    );

    if (result.isErr()) {
      return err(AtobaraiApiClientValidationError.normalize(result.error));
    }

    /**
     * For VALID credentials we receive 400 status, because credentials are fine, but we don't send valid payload.
     *
     * For invalid credentials we receive either 401 or 403, so this is what we assume is invalid credentials.
     */
    const is401 = result.value.status === 401;
    const is403 = result.value.status === 401;

    if (is401 || is403) {
      return err(
        new AtobaraiApiClientValidationError("Invalid credentials", {
          cause: new Error(`Received status code ${result.value.status}`),
        }),
      );
    }

    return ok(null);
  }
}
