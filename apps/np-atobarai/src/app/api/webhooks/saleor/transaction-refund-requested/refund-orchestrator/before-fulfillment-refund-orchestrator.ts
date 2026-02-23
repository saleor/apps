import { BaseError } from "@saleor/errors";
import { type Result } from "neverthrow";

import { type InvalidEventValidationError } from "@/app/api/webhooks/saleor/use-case-errors";
import { type AppChannelConfig } from "@/modules/app-config/app-config";
import { type IAtobaraiApiClient } from "@/modules/atobarai/api/types";
import { type AtobaraiTransactionId } from "@/modules/atobarai/atobarai-transaction-id";
import { type TransactionRecord } from "@/modules/transactions-recording/transaction-record";

import { type ParsedRefundEvent } from "../refund-event-parser";
import {
  BeforeFulfillmentFullRefundStrategy,
  BeforeFulfillmentPartialRefundWithLineItemsStrategy,
  BeforeFulfillmentPartialRefundWithoutLineItemsStrategy,
} from "../refund-strategy/before-fulfillment-strategies";
import { type BeforeFulfillmentRefundContext } from "../refund-strategy/types";
import { type TransactionRefundRequestedUseCaseResponse } from "../use-case-response";
import { BaseRefundOrchestrator } from "./base-refund-orchestrator";

export class BeforeFulfillmentRefundOrchestrator extends BaseRefundOrchestrator {
  private readonly strategies = {
    full: new BeforeFulfillmentFullRefundStrategy(),
    partialWithLineItems: new BeforeFulfillmentPartialRefundWithLineItemsStrategy(),
    partialWithoutLineItems: new BeforeFulfillmentPartialRefundWithoutLineItemsStrategy(),
  };

  private prepareContext({
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
    const context = this.prepareContext({
      parsedEvent,
      appConfig,
      atobaraiTransactionId,
      apiClient,
    });

    const strategy = this.selectStrategy(parsedEvent);

    return strategy.execute(context);
  }
}
