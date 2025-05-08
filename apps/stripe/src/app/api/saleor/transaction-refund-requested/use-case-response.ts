import { buildSyncWebhookResponsePayload } from "@saleor/app-sdk/handlers/shared";

import { SaleorMoney } from "@/modules/saleor/saleor-money";
import { SuccessWebhookResponse } from "@/modules/saleor/saleor-webhook-responses";
import { generateStripeDashboardUrl } from "@/modules/stripe/generate-stripe-dashboard-url";
import { StripeApiError } from "@/modules/stripe/stripe-api-error";
import {
  RefundFailureResult,
  RefundRequestResult,
  RefundSuccessResult,
} from "@/modules/transaction-result/refund-result";

class Success extends SuccessWebhookResponse {
  readonly transactionResult: RefundSuccessResult | RefundFailureResult | RefundRequestResult;
  readonly saleorMoney: SaleorMoney;

  constructor(args: {
    transactionResult: RefundSuccessResult | RefundFailureResult | RefundRequestResult;
    saleorMoney: SaleorMoney;
  }) {
    super();
    this.transactionResult = args.transactionResult;
    this.saleorMoney = args.saleorMoney;
  }

  getResponse(): Response {
    const typeSafeResponse = buildSyncWebhookResponsePayload<"TRANSACTION_REFUND_REQUESTED">({
      // @ts-expect-error - check why Saleor doesn't allow RefundRequestedResult here
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
  readonly transactionResult: RefundFailureResult;
  readonly saleorEventAmount: number;
  readonly error: StripeApiError;

  constructor(args: {
    transactionResult: RefundFailureResult;
    saleorEventAmount: number;
    readonly error: StripeApiError;
  }) {
    super();
    this.transactionResult = args.transactionResult;
    this.saleorEventAmount = args.saleorEventAmount;
    this.error = args.error;
  }

  getResponse(): Response {
    const typeSafeResponse = buildSyncWebhookResponsePayload<"TRANSACTION_REFUND_REQUESTED">({
      result: this.transactionResult.result,
      pspReference: this.transactionResult.stripePaymentIntentId,
      // TODO: remove this after Saleor allows to amount to be optional
      amount: this.saleorEventAmount,
      // TODO: figure out how to get the error message to not be generic
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

export const TransactionRefundRequestedUseCaseResponses = {
  Success,
  Failure,
};

export type TransactionRefundRequestedUseCaseResponsesType = InstanceType<
  | typeof TransactionRefundRequestedUseCaseResponses.Success
  | typeof TransactionRefundRequestedUseCaseResponses.Failure
>;
