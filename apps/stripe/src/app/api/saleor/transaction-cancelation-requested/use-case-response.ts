import { buildSyncWebhookResponsePayload } from "@saleor/app-sdk/handlers/shared";

import { SaleorMoney } from "@/modules/saleor/saleor-money";
import { SuccessWebhookResponse } from "@/modules/saleor/saleor-webhook-responses";
import { generateStripeDashboardUrl } from "@/modules/stripe/generate-stripe-dashboard-url";
import { StripeApiError } from "@/modules/stripe/stripe-api-error";
import {
  CancelFailureResult,
  CancelSuccessResult,
} from "@/modules/transaction-result/cancel-result";

class Success extends SuccessWebhookResponse {
  readonly transactionResult: CancelSuccessResult;
  readonly saleorMoney: SaleorMoney;

  constructor(args: { transactionResult: CancelSuccessResult; saleorMoney: SaleorMoney }) {
    super();
    this.transactionResult = args.transactionResult;
    this.saleorMoney = args.saleorMoney;
  }
  getResponse(): Response {
    const typeSafeResponse = buildSyncWebhookResponsePayload<"TRANSACTION_CANCELATION_REQUESTED">({
      result: this.transactionResult.result,
      amount: this.saleorMoney.amount,
      pspReference: this.transactionResult.stripePaymentIntentId,
      message: this.transactionResult.message,
      actions: this.transactionResult.actions,
      externalUrl: generateStripeDashboardUrl(
        this.transactionResult.stripePaymentIntentId,
        this.transactionResult.stripeEnv,
      ),
    });

    return Response.json(typeSafeResponse, { status: this.statusCode });
  }
}

class Failure extends SuccessWebhookResponse {
  readonly transactionResult: CancelFailureResult;
  readonly error: StripeApiError;
  readonly saleorEventAmount: number;

  constructor(args: {
    transactionResult: CancelFailureResult;
    error: StripeApiError;
    saleorEventAmount: number;
  }) {
    super();
    this.transactionResult = args.transactionResult;
    this.error = args.error;
    this.saleorEventAmount = args.saleorEventAmount;
  }

  getResponse(): Response {
    const typeSafeResponse = buildSyncWebhookResponsePayload<"TRANSACTION_CANCELATION_REQUESTED">({
      result: this.transactionResult.result,
      pspReference: this.transactionResult.stripePaymentIntentId,
      amount: this.saleorEventAmount,
      message: this.error.merchantMessage,
      actions: this.transactionResult.actions,
      externalUrl: generateStripeDashboardUrl(
        this.transactionResult.stripePaymentIntentId,
        this.transactionResult.stripeEnv,
      ),
    });

    return Response.json(typeSafeResponse, { status: this.statusCode });
  }
}

export const TransactionCancelationRequestedUseCaseResponses = {
  Success,
  Failure,
};

export type TransactionCancelationRequestedUseCaseResponsesType = InstanceType<
  | typeof TransactionCancelationRequestedUseCaseResponses.Success
  | typeof TransactionCancelationRequestedUseCaseResponses.Failure
>;
