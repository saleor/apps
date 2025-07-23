import { Result } from "neverthrow";

import { AppChannelConfig } from "@/modules/app-config/app-config";
import { IAtobaraiApiClient } from "@/modules/atobarai/api/types";
import { AtobaraiTransactionId } from "@/modules/atobarai/atobarai-transaction-id";

import { MalformedRequestResponse } from "../saleor-webhook-responses";
import { ParsedRefundEvent } from "./refund-event-parser";
import { TransactionRefundRequestedUseCaseResponse } from "./use-case-response";

export interface RefundContext {
  parsedEvent: ParsedRefundEvent;
  appConfig: AppChannelConfig;
  atobaraiTransactionId: AtobaraiTransactionId;
  apiClient: IAtobaraiApiClient;
  hasFulfillmentReported: boolean;
}

export interface RefundStrategy {
  canHandle(context: RefundContext): boolean;
  execute(
    context: RefundContext,
  ): Promise<Result<TransactionRefundRequestedUseCaseResponse, MalformedRequestResponse>>;
}
