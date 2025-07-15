import { BaseError } from "@saleor/errors";
import { err, ok, Result, ResultAsync } from "neverthrow";

import { assertUnreachable } from "@/lib/assert-unreachable";

import { AtobaraiMerchantCode } from "./atobarai-merchant-code";
import { AtobaraiRegisterTransactionPayload } from "./atobarai-register-transaction-payload";
import {
  createAtobaraiRegisterTransactionErrorResponse,
  createAtobaraiRegisterTransactionSuccessResponse,
  CreditCheckResult,
} from "./atobarai-register-transaction-response";
import { AtobaraiSpCode } from "./atobarai-sp-code";
import { AtobaraiTerminalId } from "./atobarai-terminal-id";
import {
  AtobaraiTransaction,
  BeforeReviewTransaction,
  FailedAtobaraiTransaction,
  PassedAtobaraiTransaction,
  PendingAtobaraiTransaction,
} from "./atobarai-transaction";
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

    if (!result.value.ok) {
      const response = await result.value.json();

      const { errors } = createAtobaraiRegisterTransactionErrorResponse(response);

      const normalizedErrors = errors.map((error) =>
        error.codes.map((code) => BaseError.normalize(code)).flat(),
      );

      return err(
        new AtobaraiApiClientRegisterTransactionError("Atobarai API returned an error", {
          errors: [normalizedErrors],
        }),
      );
    }

    const response = await result.value.json();

    const successResponse = createAtobaraiRegisterTransactionSuccessResponse(response);

    if (successResponse.results.length > 2) {
      return err(
        new AtobaraiApiClientRegisterTransactionError(
          "Atobarai API returned more than 2 results in the response",
        ),
      );
    }

    const transaction = successResponse.results[0];

    switch (transaction.authori_result) {
      case CreditCheckResult.Passed:
        return ok(PassedAtobaraiTransaction.createFromAtobaraiTransactionResponse(transaction));
      case CreditCheckResult.Pending:
        return ok(
          new PendingAtobaraiTransaction(transaction.np_transaction_id, transaction.authori_hold),
        );
      case CreditCheckResult.Failed:
        return ok(
          new FailedAtobaraiTransaction(transaction.np_transaction_id, transaction.authori_ng),
        );
      case CreditCheckResult.BeforeReview:
        return ok(new BeforeReviewTransaction(transaction.np_transaction_id));
      default:
        // @ts-expect-error - TypeScript doesn't know about the exhaustive check here
        assertUnreachable(transaction.authori_result);
    }
  }
}
