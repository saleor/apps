import { ok, Result } from "neverthrow";

import { createLogger } from "@/lib/logger";
import { createAtobaraiCancelTransactionPayload } from "@/modules/atobarai/api/atobarai-cancel-transaction-payload";
import {
  RefundFailureResult,
  RefundSuccessResult,
} from "@/modules/transaction-result/refund-result";

import { MalformedRequestResponse } from "../../saleor-webhook-responses";
import { TransactionRefundRequestedUseCaseResponse } from "../use-case-response";
import { NonFulfillmentRefundContext, RefundStrategy } from "./types";

export class NoFulfillmentFullRefundStrategy implements RefundStrategy {
  private readonly logger = createLogger("NoFulfillmentFullRefundStrategy");

  async execute(
    context: NonFulfillmentRefundContext,
  ): Promise<Result<TransactionRefundRequestedUseCaseResponse, MalformedRequestResponse>> {
    const { atobaraiTransactionId, apiClient } = context;

    const payload = createAtobaraiCancelTransactionPayload({
      atobaraiTransactionId,
    });

    const cancelResult = await apiClient.cancelTransaction(payload);

    if (cancelResult.isErr()) {
      this.logger.error("Failed to cancel Atobarai transaction", {
        error: cancelResult.error,
      });

      return ok(
        new TransactionRefundRequestedUseCaseResponse.Failure({
          transactionResult: new RefundFailureResult(),
        }),
      );
    }

    if (cancelResult.value.results.length > 1) {
      this.logger.warn("Multiple results returned from Atobarai cancel transaction", {
        results: cancelResult.value.results,
      });

      return ok(
        new TransactionRefundRequestedUseCaseResponse.Failure({
          transactionResult: new RefundFailureResult(),
        }),
      );
    }

    return ok(
      new TransactionRefundRequestedUseCaseResponse.Success({
        transactionResult: new RefundSuccessResult(),
        atobaraiTransactionId,
      }),
    );
  }
}
