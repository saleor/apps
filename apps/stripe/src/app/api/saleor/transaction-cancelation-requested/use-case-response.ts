import { buildSyncWebhookResponsePayload } from "@saleor/app-sdk/handlers/shared";

import { SaleorMoney } from "@/modules/saleor/saleor-money";
import { SuccessWebhookResponse } from "@/modules/saleor/saleor-webhook-responses";
import { StripePaymentIntentId } from "@/modules/stripe/stripe-payment-intent-id";

class CancelSuccess extends SuccessWebhookResponse {
  readonly result = "CANCEL_SUCCESS";
  readonly actions = [];
  readonly message = "Payment intent sucessfully canceled";

  readonly saleorMoney: SaleorMoney;
  readonly stripePaymentIntentId: StripePaymentIntentId;

  constructor(args: { saleorMoney: SaleorMoney; stripePaymentIntentId: StripePaymentIntentId }) {
    super();
    this.saleorMoney = args.saleorMoney;
    this.stripePaymentIntentId = args.stripePaymentIntentId;
  }
  getResponse(): Response {
    const typeSafeResponse = buildSyncWebhookResponsePayload<"TRANSACTION_CANCELATION_REQUESTED">({
      result: this.result,
      amount: this.saleorMoney.amount,
      pspReference: this.stripePaymentIntentId,
      message: this.message,
      actions: this.actions,
    });

    return Response.json(typeSafeResponse, { status: this.statusCode });
  }
}

class CancelFailure extends SuccessWebhookResponse {
  readonly result = "CANCEL_FAILURE";
  readonly actions = ["CANCEL"] as const;

  readonly stripePaymentIntentId: StripePaymentIntentId;
  readonly saleorEventAmount: number;

  constructor(args: { saleorEventAmount: number; stripePaymentIntentId: StripePaymentIntentId }) {
    super();
    this.stripePaymentIntentId = args.stripePaymentIntentId;
    this.saleorEventAmount = args.saleorEventAmount;
  }

  getResponse(): Response {
    const typeSafeResponse = buildSyncWebhookResponsePayload<"TRANSACTION_CANCELATION_REQUESTED">({
      result: this.result,
      pspReference: this.stripePaymentIntentId,
      amount: this.saleorEventAmount,
      message: "Payment intent cancelation failed",
      actions: this.actions,
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
