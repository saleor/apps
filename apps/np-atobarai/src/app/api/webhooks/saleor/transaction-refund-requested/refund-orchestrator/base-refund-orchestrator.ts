import { type Result } from "neverthrow";

import { type InvalidEventValidationError } from "@/app/api/webhooks/saleor/use-case-errors";
import { type AppChannelConfig } from "@/modules/app-config/app-config";
import { type IAtobaraiApiClient } from "@/modules/atobarai/api/types";
import { type AtobaraiTransactionId } from "@/modules/atobarai/atobarai-transaction-id";
import { type TransactionRecord } from "@/modules/transactions-recording/transaction-record";

import { type ParsedRefundEvent } from "../refund-event-parser";
import { type TransactionRefundRequestedUseCaseResponse } from "../use-case-response";

export abstract class BaseRefundOrchestrator {
  isFullRefundStrategy(parsedEvent: ParsedRefundEvent): boolean {
    /**
     * Compare against transaction, not entire order, because there may have been other payment transactions, like gift cards.
     */
    return parsedEvent.refundedAmount === parsedEvent.transactionTotalCharged;
  }

  isPartialRefundWithLineItemsStrategy(parsedEvent: ParsedRefundEvent): boolean {
    return (
      parsedEvent.refundedAmount < parsedEvent.sourceObjectTotalAmount &&
      parsedEvent.grantedRefund !== null
    );
  }

  isPartialRefundWithoutLineItemsStrategy(parsedEvent: ParsedRefundEvent): boolean {
    return (
      parsedEvent.refundedAmount < parsedEvent.sourceObjectTotalAmount && !parsedEvent.grantedRefund
    );
  }

  abstract processRefund(params: {
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
  >;
}
