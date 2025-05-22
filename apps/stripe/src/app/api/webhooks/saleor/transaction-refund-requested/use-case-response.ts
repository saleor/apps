import { buildSyncWebhookResponsePayload } from "@saleor/app-sdk/handlers/shared";

import { AppContext } from "@/lib/app-context";
import { SuccessWebhookResponse } from "@/modules/saleor/saleor-webhook-responses";
import { generatePaymentIntentStripeDashboardUrl } from "@/modules/stripe/generate-stripe-dashboard-urls";
import { StripeApiError } from "@/modules/stripe/stripe-api-error";
import { StripePaymentIntentId } from "@/modules/stripe/stripe-payment-intent-id";
import { StripeRefundId } from "@/modules/stripe/stripe-refund-id";
import { RefundFailureResult } from "@/modules/transaction-result/refund-result";

class Success extends SuccessWebhookResponse {
  readonly stripeRefundId: StripeRefundId;
  readonly message: string = "";

  constructor(args: { stripeRefundId: StripeRefundId; appContext: AppContext }) {
    super(args.appContext);
    this.stripeRefundId = args.stripeRefundId;
  }

  getResponse(): Response {
    /*
     * We are using async flow here as currently Saleor doesn't allow `REFUND_REQUEST` to be returned in `TRANSACTION_REFUND_REQUESTED` webhook response. App will report actual refund status when handling Stripe webhook.
     * https://docs.saleor.io/developer/extending/webhooks/synchronous-events/transaction#async-flow-2
     */
    const typeSafeResponse = {
      pspReference: this.stripeRefundId,
    };

    return Response.json(typeSafeResponse, { status: this.statusCode });
  }
}

class Failure extends SuccessWebhookResponse {
  readonly transactionResult: RefundFailureResult;
  readonly saleorEventAmount: number;
  readonly error: StripeApiError;
  readonly stripePaymentIntentId: StripePaymentIntentId;
  readonly message: string;

  constructor(args: {
    transactionResult: RefundFailureResult;
    saleorEventAmount: number;
    error: StripeApiError;
    stripePaymentIntentId: StripePaymentIntentId;
    appContext: AppContext;
  }) {
    super(args.appContext, args.error);
    this.transactionResult = args.transactionResult;
    this.saleorEventAmount = args.saleorEventAmount;
    this.error = args.error;
    this.stripePaymentIntentId = args.stripePaymentIntentId;
    this.message = this.error.merchantMessage;
  }

  getResponse(): Response {
    const typeSafeResponse = buildSyncWebhookResponsePayload<"TRANSACTION_REFUND_REQUESTED">({
      result: this.transactionResult.result,
      pspReference: this.stripePaymentIntentId,
      // TODO: remove this after Saleor allows to amount to be optional
      amount: this.saleorEventAmount,
      message: this.formatErrorMessage(),
      actions: this.transactionResult.actions,
      externalUrl: generatePaymentIntentStripeDashboardUrl(
        this.stripePaymentIntentId,
        this.appContext.stripeEnv,
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
