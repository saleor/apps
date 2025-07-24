import { BaseError } from "@saleor/errors";
import { ok, Result } from "neverthrow";

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
import { RefundContext } from "./refund-strategy";
import { TransactionRefundRequestedUseCaseResponse } from "./use-case-response";

export class RefundOrchestrator {
  private readonly noFulfillmentFullRefundStrategy = new NoFulfillmentFullRefundStrategy();
  private readonly noFulfillmentPartialRefundWithLineItemsStrategy =
    new NoFulfillmentPartialRefundWithLineItemsStrategy();
  private readonly noFulfillmentPartialRefundWithoutLineItemsStrategy =
    new NoFulfillmentPartialRefundWithoutLineItemsStrategy();

  private prepareContext({
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
  }): RefundContext {
    return {
      parsedEvent,
      appConfig,
      atobaraiTransactionId,
      apiClient,
      hasFulfillmentReported,
    };
  }

  private isFullRefundStrategy(parsedEvent: ParsedRefundEvent): boolean {
    return parsedEvent.refundedAmount === parsedEvent.sourceObjectTotalAmount;
  }

  private isPartialRefundWithLineItemsStrategy(parsedEvent: ParsedRefundEvent): boolean {
    return (
      parsedEvent.refundedAmount < parsedEvent.sourceObjectTotalAmount &&
      parsedEvent.grantedRefund !== null
    );
  }

  private isPartialRefundWithoutLineItemsStrategy(parsedEvent: ParsedRefundEvent): boolean {
    return (
      parsedEvent.refundedAmount < parsedEvent.sourceObjectTotalAmount && !parsedEvent.grantedRefund
    );
  }

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
    const context = this.prepareContext({
      parsedEvent,
      appConfig,
      atobaraiTransactionId,
      apiClient,
      hasFulfillmentReported,
    });

    if (hasFulfillmentReported) {
      /*
       * TODO: Implement fulfillment reported case
       */

      return ok(
        new TransactionRefundRequestedUseCaseResponse.Failure({
          transactionResult: new RefundFailureResult(),
        }),
      );
    } else {
      if (this.isFullRefundStrategy(parsedEvent)) {
        return this.noFulfillmentFullRefundStrategy.execute(context);
      }

      if (this.isPartialRefundWithoutLineItemsStrategy(parsedEvent)) {
        return this.noFulfillmentPartialRefundWithoutLineItemsStrategy.execute(context);
      }

      if (this.isPartialRefundWithLineItemsStrategy(parsedEvent)) {
        return this.noFulfillmentPartialRefundWithLineItemsStrategy.execute(context);
      }
    }

    throw new BaseError(
      `Leaky abstraction: No refund strategy found for event ${parsedEvent.pspReference}`,
    );
  }
}
