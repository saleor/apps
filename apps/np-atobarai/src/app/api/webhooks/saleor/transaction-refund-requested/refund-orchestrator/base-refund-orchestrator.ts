import { Result } from "neverthrow";

import { InvalidEventValidationError } from "@/app/api/webhooks/saleor/use-case-errors";
import { AppChannelConfig } from "@/modules/app-config/app-config";
import { IAtobaraiApiClient } from "@/modules/atobarai/api/types";
import { AtobaraiTransactionId } from "@/modules/atobarai/atobarai-transaction-id";
import { TransactionRecord } from "@/modules/transactions-recording/transaction-record";

import { ParsedRefundEvent } from "../refund-event-parser";
import { TransactionRefundRequestedUseCaseResponse } from "../use-case-response";

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
