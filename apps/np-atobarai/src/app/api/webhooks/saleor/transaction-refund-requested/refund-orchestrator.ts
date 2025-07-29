import { BaseError } from "@saleor/errors";
import { Result } from "neverthrow";

import { AppChannelConfig } from "@/modules/app-config/app-config";
import { IAtobaraiApiClient } from "@/modules/atobarai/api/types";
import { AtobaraiShippingCompanyCode } from "@/modules/atobarai/atobarai-shipping-company-code";
import { AtobaraiTransactionId } from "@/modules/atobarai/atobarai-transaction-id";
import { TransactionRecord } from "@/modules/transactions-recording/transaction-record";

import { MalformedRequestResponse } from "../saleor-webhook-responses";
import { ParsedRefundEvent } from "./refund-event-parser";
import {
  AfterFulfillmentFullRefundStrategy,
  AfterFulfillmentPartialRefundWithLineItemsStrategy,
  AfterFulfillmentPartialRefundWithoutLineItemsStrategy,
} from "./refund-strategy/after-fulfillment-strategies";
import {
  BeforeFulfillmentFullRefundStrategy,
  BeforeFulfillmentPartialRefundWithLineItemsStrategy,
  BeforeFulfillmentPartialRefundWithoutLineItemsStrategy,
} from "./refund-strategy/before-fulfillment-strategies";
import {
  AfterFulfillmentRefundContext,
  BeforeFulfillmentRefundContext,
} from "./refund-strategy/types";
import { TransactionRefundRequestedUseCaseResponse } from "./use-case-response";

export class RefundOrchestrator {
  private readonly beforeFullfillmentStrategies = {
    full: new BeforeFulfillmentFullRefundStrategy(),
    partialWithLineItems: new BeforeFulfillmentPartialRefundWithLineItemsStrategy(),
    partialWithoutLineItems: new BeforeFulfillmentPartialRefundWithoutLineItemsStrategy(),
  };

  private readonly afterFullfillmentStrategies = {
    full: new AfterFulfillmentFullRefundStrategy(),
    partialWithLineItems: new AfterFulfillmentPartialRefundWithLineItemsStrategy(),
    partialWithoutLineItems: new AfterFulfillmentPartialRefundWithoutLineItemsStrategy(),
  };

  private prepareBeforeFulfillmentContext({
    parsedEvent,
    appConfig,
    atobaraiTransactionId,
    apiClient,
  }: {
    parsedEvent: ParsedRefundEvent;
    appConfig: AppChannelConfig;
    atobaraiTransactionId: AtobaraiTransactionId;
    apiClient: IAtobaraiApiClient;
  }): BeforeFulfillmentRefundContext {
    return {
      parsedEvent,
      appConfig,
      atobaraiTransactionId,
      apiClient,
    };
  }

  private prepareAfterFulfillmentContext({
    parsedEvent,
    appConfig,
    atobaraiTransactionId,
    apiClient,
    trackingNumber,
    shippingCompanyCode,
  }: {
    parsedEvent: ParsedRefundEvent;
    appConfig: AppChannelConfig;
    atobaraiTransactionId: AtobaraiTransactionId;
    apiClient: IAtobaraiApiClient;
    trackingNumber: string;
    shippingCompanyCode: AtobaraiShippingCompanyCode;
  }): AfterFulfillmentRefundContext {
    return {
      parsedEvent,
      appConfig,
      atobaraiTransactionId,
      apiClient,
      trackingNumber,
      shippingCompanyCode,
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

  private selectBeforeFulfillmentStrategy(parsedEvent: ParsedRefundEvent) {
    if (this.isFullRefundStrategy(parsedEvent)) {
      return this.beforeFullfillmentStrategies.full;
    }

    if (this.isPartialRefundWithLineItemsStrategy(parsedEvent)) {
      return this.beforeFullfillmentStrategies.partialWithLineItems;
    }

    if (this.isPartialRefundWithoutLineItemsStrategy(parsedEvent)) {
      return this.beforeFullfillmentStrategies.partialWithoutLineItems;
    }

    throw new BaseError(
      `Leaky abstraction: No before fulfillment refund strategy found for event ${parsedEvent.pspReference}`,
    );
  }

  private selectAfterFulfillmentStrategy(parsedEvent: ParsedRefundEvent) {
    if (this.isFullRefundStrategy(parsedEvent)) {
      return this.afterFullfillmentStrategies.full;
    }
    if (this.isPartialRefundWithLineItemsStrategy(parsedEvent)) {
      return this.afterFullfillmentStrategies.partialWithLineItems;
    }
    if (this.isPartialRefundWithoutLineItemsStrategy(parsedEvent)) {
      return this.afterFullfillmentStrategies.partialWithoutLineItems;
    }
    throw new BaseError(
      `Leaky abstraction: No after fulfillment refund strategy found for event ${parsedEvent.pspReference}`,
    );
  }

  async processRefund({
    parsedEvent,
    appConfig,
    atobaraiTransactionId,
    apiClient,
    transactionRecord,
  }: {
    parsedEvent: ParsedRefundEvent;
    appConfig: AppChannelConfig;
    atobaraiTransactionId: AtobaraiTransactionId;
    apiClient: IAtobaraiApiClient;
    transactionRecord: TransactionRecord;
  }): Promise<Result<TransactionRefundRequestedUseCaseResponse, MalformedRequestResponse>> {
    if (transactionRecord.hasFulfillmentReported()) {
      const trackingNumber = transactionRecord.saleorTrackingNumber;

      if (!trackingNumber) {
        throw new BaseError(
          `Tracking number is required for after fulfillment refund, but not provided for transaction ${atobaraiTransactionId}`,
        );
      }

      const context = this.prepareAfterFulfillmentContext({
        parsedEvent,
        appConfig,
        atobaraiTransactionId,
        apiClient,
        trackingNumber,
        shippingCompanyCode:
          transactionRecord.fulfillmentMetadataShippingCompanyCode || appConfig.shippingCompanyCode,
      });

      const strategy = this.selectAfterFulfillmentStrategy(parsedEvent);

      return strategy.execute(context);
    } else {
      const context = this.prepareBeforeFulfillmentContext({
        parsedEvent,
        appConfig,
        atobaraiTransactionId,
        apiClient,
      });

      const strategy = this.selectBeforeFulfillmentStrategy(parsedEvent);

      return strategy.execute(context);
    }
  }
}
