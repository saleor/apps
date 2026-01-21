import { BaseError } from "@saleor/errors";
import { Result } from "neverthrow";

import { InvalidEventValidationError } from "@/app/api/webhooks/saleor/use-case-errors";
import { AppChannelConfig } from "@/modules/app-config/app-config";
import { IAtobaraiApiClient } from "@/modules/atobarai/api/types";
import { AtobaraiShippingCompanyCode } from "@/modules/atobarai/atobarai-shipping-company-code";
import { AtobaraiTransactionId } from "@/modules/atobarai/atobarai-transaction-id";
import { TransactionRecord } from "@/modules/transactions-recording/transaction-record";

import { ParsedRefundEvent } from "../refund-event-parser";
import {
  AfterFulfillmentFullRefundStrategy,
  AfterFulfillmentPartialRefundWithLineItemsStrategy,
  AfterFulfillmentPartialRefundWithoutLineItemsStrategy,
} from "../refund-strategy/after-fulfillment-strategies";
import { AfterFulfillmentRefundContext } from "../refund-strategy/types";
import { TransactionRefundRequestedUseCaseResponse } from "../use-case-response";
import { BaseRefundOrchestrator } from "./base-refund-orchestrator";

export class AfterFulfillmentRefundOrchestrator extends BaseRefundOrchestrator {
  private readonly strategies = {
    full: new AfterFulfillmentFullRefundStrategy(),
    partialWithLineItems: new AfterFulfillmentPartialRefundWithLineItemsStrategy(),
    partialWithoutLineItems: new AfterFulfillmentPartialRefundWithoutLineItemsStrategy(),
  };

  private prepareContext({
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

  private selectStrategy(parsedEvent: ParsedRefundEvent) {
    if (this.isFullRefundStrategy(parsedEvent)) {
      return this.strategies.full;
    }
    if (this.isPartialRefundWithLineItemsStrategy(parsedEvent)) {
      return this.strategies.partialWithLineItems;
    }
    if (this.isPartialRefundWithoutLineItemsStrategy(parsedEvent)) {
      return this.strategies.partialWithoutLineItems;
    }

    throw new BaseError("No matching refund strategy found for the given event conditions", {
      props: {
        pspReference: parsedEvent.pspReference,
      },
    });
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
  }): Promise<
    Result<
      TransactionRefundRequestedUseCaseResponse,
      InstanceType<typeof InvalidEventValidationError>
    >
  > {
    const trackingNumber = transactionRecord.saleorTrackingNumber;

    if (!trackingNumber) {
      throw new BaseError(
        `Tracking number is required for after fulfillment refund, but not provided for transaction ${atobaraiTransactionId}`,
      );
    }

    const context = this.prepareContext({
      parsedEvent,
      appConfig,
      atobaraiTransactionId,
      apiClient,
      trackingNumber,
      shippingCompanyCode:
        transactionRecord.fulfillmentMetadataShippingCompanyCode || appConfig.shippingCompanyCode,
    });

    const strategy = this.selectStrategy(parsedEvent);

    return strategy.execute(context);
  }
}
