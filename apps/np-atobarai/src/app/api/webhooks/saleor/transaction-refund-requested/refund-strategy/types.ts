import { type Result } from "neverthrow";

import { type InvalidEventValidationError } from "@/app/api/webhooks/saleor/use-case-errors";
import { type AppChannelConfig } from "@/modules/app-config/app-config";
import { type IAtobaraiApiClient } from "@/modules/atobarai/api/types";
import { type AtobaraiShippingCompanyCode } from "@/modules/atobarai/atobarai-shipping-company-code";
import { type AtobaraiTransactionId } from "@/modules/atobarai/atobarai-transaction-id";

import { type ParsedRefundEvent } from "../refund-event-parser";
import { type TransactionRefundRequestedUseCaseResponse } from "../use-case-response";

export interface BeforeFulfillmentRefundContext {
  parsedEvent: ParsedRefundEvent;
  appConfig: AppChannelConfig;
  atobaraiTransactionId: AtobaraiTransactionId;
  apiClient: IAtobaraiApiClient;
}

export interface AfterFulfillmentRefundContext {
  parsedEvent: ParsedRefundEvent;
  appConfig: AppChannelConfig;
  atobaraiTransactionId: AtobaraiTransactionId;
  apiClient: IAtobaraiApiClient;
  trackingNumber: string;
  shippingCompanyCode: AtobaraiShippingCompanyCode;
}

export interface BeforeFulfillmentRefundStrategy {
  execute(
    context: BeforeFulfillmentRefundContext,
  ): Promise<
    Result<
      TransactionRefundRequestedUseCaseResponse,
      InstanceType<typeof InvalidEventValidationError>
    >
  >;
}

export interface AfterFulfillmentRefundStrategy {
  execute(
    context: AfterFulfillmentRefundContext,
  ): Promise<
    Result<
      TransactionRefundRequestedUseCaseResponse,
      InstanceType<typeof InvalidEventValidationError>
    >
  >;
}
