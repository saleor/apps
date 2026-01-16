import { Result } from "neverthrow";

import { InvalidEventValidationError } from "@/app/api/webhooks/saleor/use-case-errors";
import { AppChannelConfig } from "@/modules/app-config/app-config";
import { IAtobaraiApiClient } from "@/modules/atobarai/api/types";
import { AtobaraiShippingCompanyCode } from "@/modules/atobarai/atobarai-shipping-company-code";
import { AtobaraiTransactionId } from "@/modules/atobarai/atobarai-transaction-id";

import { ParsedRefundEvent } from "../refund-event-parser";
import { TransactionRefundRequestedUseCaseResponse } from "../use-case-response";

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
