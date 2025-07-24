import { BaseError } from "@saleor/errors";
import { ok, Result } from "neverthrow";

import { AppChannelConfig } from "@/modules/app-config/app-config";
import { IAtobaraiApiClient } from "@/modules/atobarai/api/types";
import { AtobaraiShippingCompanyCode } from "@/modules/atobarai/atobarai-shipping-company-code";
import { AtobaraiTransactionId } from "@/modules/atobarai/atobarai-transaction-id";
import { RefundFailureResult } from "@/modules/transaction-result/refund-result";

import { MalformedRequestResponse } from "../saleor-webhook-responses";
import { ParsedRefundEvent } from "./refund-event-parser";
import { FulfillmentFullRefundStrategy } from "./refund-strategy/fulfillment-full-refund-strategy";
import { FulfillmentPartialRefundWithoutLineItemsStrategy } from "./refund-strategy/fulfillment-partial-refund-without-line-items-strategy";
import { NoFulfillmentFullRefundStrategy } from "./refund-strategy/no-fulfillment-full-refund-strategy";
import { NoFulfillmentPartialRefundWithLineItemsStrategy } from "./refund-strategy/no-fulfillment-partial-refund-with-line-items-strategy";
import { NoFulfillmentPartialRefundWithoutLineItemsStrategy } from "./refund-strategy/no-fulfillment-partial-refund-without-line-items-strategy";
import { FulfillmentRefundContext, NonFulfillmentRefundContext } from "./refund-strategy/types";
import { TransactionRefundRequestedUseCaseResponse } from "./use-case-response";

export class RefundOrchestrator {
  private readonly fulfillmentFullRefundStrategy = new FulfillmentFullRefundStrategy();
  private readonly fulfillmentPartialRefundWithoutLineItemsStrategy =
    new FulfillmentPartialRefundWithoutLineItemsStrategy();
  private readonly noFulfillmentFullRefundStrategy = new NoFulfillmentFullRefundStrategy();
  private readonly noFulfillmentPartialRefundWithLineItemsStrategy =
    new NoFulfillmentPartialRefundWithLineItemsStrategy();
  private readonly noFulfillmentPartialRefundWithoutLineItemsStrategy =
    new NoFulfillmentPartialRefundWithoutLineItemsStrategy();

  private prepareNonFulfillmentContext({
    parsedEvent,
    appConfig,
    atobaraiTransactionId,
    apiClient,
  }: {
    parsedEvent: ParsedRefundEvent;
    appConfig: AppChannelConfig;
    atobaraiTransactionId: AtobaraiTransactionId;
    apiClient: IAtobaraiApiClient;
  }): NonFulfillmentRefundContext {
    return {
      parsedEvent,
      appConfig,
      atobaraiTransactionId,
      apiClient,
    };
  }

  private prepareFulfillmentContext({
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
    trackingNumber: string | null;
    shippingCompanyCode: AtobaraiShippingCompanyCode;
  }): FulfillmentRefundContext {
    if (!trackingNumber) {
      throw new BaseError("Tracking number is required for fulfillment.");
    }

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

  async processRefund({
    parsedEvent,
    appConfig,
    atobaraiTransactionId,
    apiClient,
    hasFulfillmentReported,
    saleorTrackingNumber,
  }: {
    parsedEvent: ParsedRefundEvent;
    appConfig: AppChannelConfig;
    atobaraiTransactionId: AtobaraiTransactionId;
    apiClient: IAtobaraiApiClient;
    hasFulfillmentReported: boolean;
    saleorTrackingNumber: string | null;
  }): Promise<Result<TransactionRefundRequestedUseCaseResponse, MalformedRequestResponse>> {
    if (hasFulfillmentReported) {
      const context = this.prepareFulfillmentContext({
        parsedEvent,
        appConfig,
        atobaraiTransactionId,
        apiClient,
        trackingNumber: saleorTrackingNumber,
        shippingCompanyCode: appConfig.shippingCompanyCode,
      });

      if (this.isFullRefundStrategy(parsedEvent)) {
        return this.fulfillmentFullRefundStrategy.execute(context);
      }

      if (this.isPartialRefundWithoutLineItemsStrategy(parsedEvent)) {
        return this.fulfillmentPartialRefundWithoutLineItemsStrategy.execute(context);
      }

      return ok(
        new TransactionRefundRequestedUseCaseResponse.Failure({
          transactionResult: new RefundFailureResult(),
        }),
      );
    } else {
      const context = this.prepareNonFulfillmentContext({
        parsedEvent,
        appConfig,
        atobaraiTransactionId,
        apiClient,
      });

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
