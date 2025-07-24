import { Result } from "neverthrow";

import { AppChannelConfig } from "@/modules/app-config/app-config";
import { IAtobaraiApiClient } from "@/modules/atobarai/api/types";
import { AtobaraiTransactionId } from "@/modules/atobarai/atobarai-transaction-id";

import { MalformedRequestResponse } from "../../saleor-webhook-responses";
import { ParsedRefundEvent } from "../refund-event-parser";
import { TransactionRefundRequestedUseCaseResponse } from "../use-case-response";
import { AtobaraiShippingCompanyCode } from "@/modules/atobarai/atobarai-shipping-company-code";

export interface NonFulfillmentRefundContext {
  parsedEvent: ParsedRefundEvent;
  appConfig: AppChannelConfig;
  atobaraiTransactionId: AtobaraiTransactionId;
  apiClient: IAtobaraiApiClient;
}

export interface FulfillmentRefundContext {
  parsedEvent: ParsedRefundEvent;
  appConfig: AppChannelConfig;
  atobaraiTransactionId: AtobaraiTransactionId;
  apiClient: IAtobaraiApiClient;
  trackingNumber: string;
  shippingCompanyCode: AtobaraiShippingCompanyCode;
}

export interface RefundStrategy {
  execute(
    context: NonFulfillmentRefundContext | FulfillmentRefundContext,
  ): Promise<Result<TransactionRefundRequestedUseCaseResponse, MalformedRequestResponse>>;
}
