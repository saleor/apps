import { buildSyncWebhookResponsePayload } from "@saleor/app-sdk/handlers/shared";

import { SuccessWebhookResponse } from "@/modules/saleor/saleor-webhook-responses";
import { generateStripeDashboardUrl } from "@/modules/stripe/generate-stripe-dashboard-url";
import { StripeApiError } from "@/modules/stripe/stripe-api-error";
import { StripePaymentIntentId } from "@/modules/stripe/stripe-payment-intent-id";
import { RefundFailureResult } from "@/modules/transaction-result/refund-result";

class Success extends SuccessWebhookResponse {
  readonly stripePaymentIntentId: StripePaymentIntentId;

  constructor(args: { stripePaymentIntentId: StripePaymentIntentId }) {
    super();
    this.stripePaymentIntentId = args.stripePaymentIntentId;
  }

  getResponse(): Response {
    /*
     * We are using async flow here as currently Saleor doesn't allow `REFUND_REQUEST` to be returned in `TRANSACTION_REFUND_REQUESTED` webhook response. App will report actual refund status when handling Stripe webhook.
     * https://docs.saleor.io/developer/extending/webhooks/synchronous-events/transaction#async-flow-2
     */
    const typeSafeResponse = {
      pspReference: this.stripePaymentIntentId,
    };

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
