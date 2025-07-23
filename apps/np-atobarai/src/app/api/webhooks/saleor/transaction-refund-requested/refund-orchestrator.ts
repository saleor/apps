import { ok, Result } from "neverthrow";

import { createLogger } from "@/lib/logger";
import { AppChannelConfig } from "@/modules/app-config/app-config";
import { IAtobaraiApiClient } from "@/modules/atobarai/api/types";
import { AtobaraiTransactionId } from "@/modules/atobarai/atobarai-transaction-id";
import { RefundFailureResult } from "@/modules/transaction-result/refund-result";

import { MalformedRequestResponse } from "../saleor-webhook-responses";
import { ParsedRefundEvent } from "./refund-event-parser";
import {
  NoFulfillmentFullRefundStrategy,
  NoFulfillmentPartialRefundWithLineItemsStrategy,
  NoFulfillmentPartialRefundWithoutLineItemsStrategy,
} from "./refund-strategies";
import { RefundContext, RefundStrategy } from "./refund-strategy";
import { TransactionRefundRequestedUseCaseResponse } from "./use-case-response";

export class RefundOrchestrator {
  private readonly logger = createLogger("RefundOrchestrator");
  private readonly strategies: RefundStrategy[] = [
    new NoFulfillmentFullRefundStrategy(),
    new NoFulfillmentPartialRefundWithLineItemsStrategy(),
    new NoFulfillmentPartialRefundWithoutLineItemsStrategy(),
  ];

  async processRefund({
    parsedEvent,
    appConfig,
    atobaraiTransactionId,
    apiClient,
    hasFulfillmentReported,
  }: {
    parsedEvent: ParsedRefundEvent;
    appConfig: AppChannelConfig;
    atobaraiTransactionId: AtobaraiTransactionId;
    apiClient: IAtobaraiApiClient;
    hasFulfillmentReported: boolean;
  }): Promise<Result<TransactionRefundRequestedUseCaseResponse, MalformedRequestResponse>> {
    if (hasFulfillmentReported) {
      // TODO: Implement fulfillment reported case
      this.logger.warn("Fulfillment reported case not yet implemented");

      return ok(
        new TransactionRefundRequestedUseCaseResponse.Failure({
          transactionResult: new RefundFailureResult(),
        }),
      );
    }

    const context: RefundContext = {
      parsedEvent,
      appConfig,
      atobaraiTransactionId,
      apiClient,
      hasFulfillmentReported,
    };

    const strategy = this.strategies.find((s) => s.canHandle(context));

    if (!strategy) {
      this.logger.warn("No strategy found for refund type", {
        refundedAmount: parsedEvent.refundedAmount,
        sourceObjectTotalAmount: parsedEvent.sourceObjectTotalAmount,
        hasGrantedRefund: !!parsedEvent.grantedRefund,
      });

      return ok(
        new TransactionRefundRequestedUseCaseResponse.Failure({
          transactionResult: new RefundFailureResult(),
        }),
      );
    }

    this.logger.info("Processing refund with strategy", {
      strategy: strategy.constructor.name,
      refundedAmount: parsedEvent.refundedAmount,
      sourceObjectTotalAmount: parsedEvent.sourceObjectTotalAmount,
    });

    return strategy.execute(context);
  }
}
