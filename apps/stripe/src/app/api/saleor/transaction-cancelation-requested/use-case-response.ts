import { buildSyncWebhookResponsePayload } from "@saleor/app-sdk/handlers/shared";

import { SuccessWebhookResponse } from "@/modules/saleor/saleor-webhook-responses";
import { generateStripeDashboardUrl } from "@/modules/stripe/generate-stripe-dashboard-url";
import {
  StripeCancelPaymentIntentAPIError,
  StripeCapturePaymentIntentAPIError,
} from "@/modules/stripe/stripe-payment-intent-api-error";
import {
  CancelFailureResult,
  CancelSuccessResult,
} from "@/modules/transaction-result/cancel-result";

class CancelSuccess extends SuccessWebhookResponse {
  readonly transactionResult: CancelSuccessResult;

  constructor(args: { transactionResult: CancelSuccessResult }) {
    super();
    this.transactionResult = args.transactionResult;
  }
  getResponse(): Response {
    const typeSafeResponse = buildSyncWebhookResponsePayload<"TRANSACTION_CANCELATION_REQUESTED">({
      result: this.transactionResult.result,
      amount: this.transactionResult.saleorMoney.amount,
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

class CancelFailure extends SuccessWebhookResponse {
  readonly transactionResult: CancelFailureResult;
  readonly error: StripeCancelPaymentIntentAPIError;

  constructor(args: {
    transactionResult: CancelFailureResult;
    error: StripeCapturePaymentIntentAPIError;
  }) {
    super();
    this.transactionResult = args.transactionResult;
    this.error = args.error;
  }

  getResponse(): Response {
    const typeSafeResponse = buildSyncWebhookResponsePayload<"TRANSACTION_CANCELATION_REQUESTED">({
      result: this.transactionResult.result,
      pspReference: this.transactionResult.stripePaymentIntentId,
      amount: this.transactionResult.saleorEventAmount,
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
  CancelSuccess,
  CancelFailure,
};

export type TransactionCancelationRequestedUseCaseResponsesType = InstanceType<
  (typeof TransactionCancelationRequestedUseCaseResponses)[keyof typeof TransactionCancelationRequestedUseCaseResponses]
>;
