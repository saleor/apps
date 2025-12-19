import { BaseError } from "@saleor/errors";
import { err, ok, Result, ResultAsync } from "neverthrow";

import { createLogger } from "@/lib/logger";

import { AtobaraiMerchantCode } from "../atobarai-merchant-code";
import { AtobaraiSecretSpCode } from "../atobarai-secret-sp-code";
import { AtobaraiTerminalId } from "../atobarai-terminal-id";
import { AtobaraiCancelTransactionPayload } from "./atobarai-cancel-transaction-payload";
import {
  AtobaraiCancelTransactionSuccessResponse,
  createAtobaraiCancelTransactionSuccessResponse,
} from "./atobarai-cancel-transaction-success-response";
import { AtobaraiChangeTransactionPayload } from "./atobarai-change-transaction-payload";
import { createAtobaraiErrorResponse } from "./atobarai-error-response";
import { AtobaraiFulfillmentReportPayload } from "./atobarai-fulfillment-report-payload";
import {
  AtobaraiFulfillmentReportSuccessResponse,
  createAtobaraiFulfillmentReportSuccessResponse,
} from "./atobarai-fulfillment-report-success-response";
import { AtobaraiRegisterTransactionPayload } from "./atobarai-register-transaction-payload";
import {
  AtobaraiTransactionSuccessResponse,
  createAtobaraiTransactionSuccessResponse,
} from "./atobarai-transaction-success-response";
import {
  AtobaraiApiChangeTransactionErrors,
  AtobaraiApiClientCancelTransactionError,
  AtobaraiApiClientChangeTransactionError,
  AtobaraiApiClientFulfillmentReportError,
  AtobaraiApiClientRegisterTransactionError,
  AtobaraiApiClientValidationError,
  AtobaraiApiRegisterTransactionErrors,
  AtobaraiEnvironment,
  AtobaraiMultipleResultsError,
  IAtobaraiApiClient,
} from "./types";

export class AtobaraiApiClient implements IAtobaraiApiClient {
  static AtobaraiApiError = BaseError.subclass("AtobaraiApiError", {
    props: {
      _brand: "AtobaraiApiError" as const,
      code: "",
    },
  });

  private atobaraiTerminalId: AtobaraiTerminalId;
  private atobaraiMerchantCode: AtobaraiMerchantCode;
  private atobaraiSecretSpCode: AtobaraiSecretSpCode;
  private atobaraiEnvironment: AtobaraiEnvironment;
  private logger = createLogger("AtobaraiApiClient");

  private constructor(args: {
    atobaraiTerminalId: AtobaraiTerminalId;
    atobaraiMerchantCode: AtobaraiMerchantCode;
    atobaraiSecretSpCode: AtobaraiSecretSpCode;
    atobaraiEnvironment: AtobaraiEnvironment;
  }) {
    this.atobaraiTerminalId = args.atobaraiTerminalId;
    this.atobaraiMerchantCode = args.atobaraiMerchantCode;
    this.atobaraiSecretSpCode = args.atobaraiSecretSpCode;
    this.atobaraiEnvironment = args.atobaraiEnvironment;
  }

  static create(args: {
    atobaraiTerminalId: AtobaraiTerminalId;
    atobaraiMerchantCode: AtobaraiMerchantCode;
    atobaraiSecretSpCode: AtobaraiSecretSpCode;
    atobaraiEnvironment: AtobaraiEnvironment;
  }): IAtobaraiApiClient {
    return new AtobaraiApiClient({
      atobaraiTerminalId: args.atobaraiTerminalId,
      atobaraiMerchantCode: args.atobaraiMerchantCode,
      atobaraiSecretSpCode: args.atobaraiSecretSpCode,
      atobaraiEnvironment: args.atobaraiEnvironment,
    });
  }

  private getHeaders(): HeadersInit {
    return {
      "X-NP-Terminal-Id": this.atobaraiTerminalId,
      Authorization: `Basic ${btoa(`${this.atobaraiMerchantCode}:${this.atobaraiSecretSpCode}`)}`,
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
  ): InstanceType<typeof AtobaraiApiClient.AtobaraiApiError>[] {
    const { errors } = createAtobaraiErrorResponse(response);

    return errors.flatMap((error) =>
      error.codes.map(
        (code) =>
          new AtobaraiApiClient.AtobaraiApiError("API returned an error", { props: { code } }),
      ),
    );
  }

  async registerTransaction(
    payload: AtobaraiRegisterTransactionPayload,
    options?: {
      rejectMultipleResults?: boolean;
    },
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

      this.logger.warn("Atobarai API returned an error on registerTransaction", {
        status: result.value.status,
        errorCodes: errors.map((e) => e.code),
        response,
      });

      return err(
        new AtobaraiApiClientRegisterTransactionError("Atobarai API returned an error", {
          errors,
          props: {
            apiError: errors.length > 0 ? errors[0].code : undefined,
          },
        }),
      );
    }

    const response = await result.value.json();

    const parsedResponse = createAtobaraiTransactionSuccessResponse(response);

    if (options?.rejectMultipleResults) {
      if (parsedResponse.results.length > 1) {
        return err(new AtobaraiMultipleResultsError("Multiple results found"));
      }
    }

    return ok(parsedResponse);
  }

  async changeTransaction(
    payload: AtobaraiChangeTransactionPayload,
    options?: {
      rejectMultipleResults?: boolean;
    },
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

      this.logger.warn("Atobarai API returned an error on changeTransaction", {
        status: result.value.status,
        errorCodes: errors.map((e) => e.code),
        response,
      });

      return err(
        new AtobaraiApiClientChangeTransactionError("Atobarai API returned an error", {
          errors,
          props: {
            apiError: errors.length > 0 ? errors[0].code : undefined,
          },
        }),
      );
    }

    const response = await result.value.json();

    const parsedResponse = createAtobaraiTransactionSuccessResponse(response);

    if (options?.rejectMultipleResults) {
      if (parsedResponse.results.length > 1) {
        return err(new AtobaraiMultipleResultsError("Multiple results found"));
      }
    }

    return ok(parsedResponse);
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
      this.logger.warn(
        "Atobarai API returned an error: invalid credentials error on verifyCredentials",
        {
          status: result.value.status,
        },
      );

      return err(
        new AtobaraiApiClientValidationError("Invalid credentials", {
          cause: new Error(`Received status code ${result.value.status}`),
        }),
      );
    }

    return ok(null);
  }

  async reportFulfillment(
    payload: AtobaraiFulfillmentReportPayload,
    options?: {
      rejectMultipleResults?: boolean;
    },
  ): Promise<
    Result<AtobaraiFulfillmentReportSuccessResponse, AtobaraiApiClientFulfillmentReportError>
  > {
    const requestUrl = new URL("shipments", this.getBaseUrl());

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
        new AtobaraiApiClientFulfillmentReportError("Failed to report fulfillment", {
          cause: result.error,
        }),
      );
    }

    if (!result.value.ok) {
      const response = await result.value.json();

      const errors = this.convertErrorResponseToNormalizedErrors(response);

      this.logger.warn("Atobarai API returned an error on reportFulfillment", {
        status: result.value.status,
        errorCodes: errors.map((e) => e.code),
        response,
      });

      return err(
        new AtobaraiApiClientFulfillmentReportError("Atobarai API returned an error", {
          errors,
        }),
      );
    }

    const response = await result.value.json();

    const parsedResponse = createAtobaraiFulfillmentReportSuccessResponse(response);

    if (options?.rejectMultipleResults) {
      if (parsedResponse.results.length > 1) {
        return err(new AtobaraiMultipleResultsError("Multiple results found"));
      }
    }

    return ok(parsedResponse);
  }

  async cancelTransaction(
    payload: AtobaraiCancelTransactionPayload,
    options?: {
      rejectMultipleResults?: boolean;
    },
  ): Promise<
    Result<AtobaraiCancelTransactionSuccessResponse, AtobaraiApiClientCancelTransactionError>
  > {
    const requestUrl = new URL("transactions/cancel", this.getBaseUrl());

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
        new AtobaraiApiClientCancelTransactionError("Failed to cancel transaction", {
          cause: result.error,
        }),
      );
    }

    if (!result.value.ok) {
      const response = await result.value.json();

      const errors = this.convertErrorResponseToNormalizedErrors(response);

      this.logger.warn("Atobarai API returned an error on cancelTransaction", {
        status: result.value.status,
        errorCodes: errors.map((e) => e.code),
        response,
      });

      return err(
        new AtobaraiApiClientCancelTransactionError("Atobarai API returned an error", {
          errors,
        }),
      );
    }

    const response = await result.value.json();

    const parsedResponse = createAtobaraiCancelTransactionSuccessResponse(response);

    if (options?.rejectMultipleResults) {
      if (parsedResponse.results.length > 1) {
        return err(new AtobaraiMultipleResultsError("Multiple results found"));
      }
    }

    return ok(parsedResponse);
  }
}
