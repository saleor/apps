import { buildSyncWebhookResponsePayload } from "@saleor/app-sdk/handlers/shared";

import { SaleorMoney } from "@/modules/saleor/saleor-money";
import { SuccessWebhookResponse } from "@/modules/saleor/saleor-webhook-responses";
import { generateStripeDashboardUrl } from "@/modules/stripe/generate-stripe-dashboard-url";
import { StripeEnv } from "@/modules/stripe/stripe-env";
import {
  StripeCancelPaymentIntentAPIError,
  StripeCapturePaymentIntentAPIError,
} from "@/modules/stripe/stripe-payment-intent-api-error";
import { StripePaymentIntentId } from "@/modules/stripe/stripe-payment-intent-id";

class CancelSuccess extends SuccessWebhookResponse {
  readonly result = "CANCEL_SUCCESS";
  readonly actions = [];
  readonly message = "Payment intent sucessfully canceled";

  readonly saleorMoney: SaleorMoney;
  readonly stripePaymentIntentId: StripePaymentIntentId;
  readonly stripeEnv: StripeEnv;

  constructor(args: {
    saleorMoney: SaleorMoney;
    stripePaymentIntentId: StripePaymentIntentId;
    stripeEnv: StripeEnv;
  }) {
    super();
    this.saleorMoney = args.saleorMoney;
    this.stripePaymentIntentId = args.stripePaymentIntentId;
    this.stripeEnv = args.stripeEnv;
  }
  getResponse(): Response {
    const typeSafeResponse = buildSyncWebhookResponsePayload<"TRANSACTION_CANCELATION_REQUESTED">({
      result: this.result,
      amount: this.saleorMoney.amount,
      pspReference: this.stripePaymentIntentId,
      message: this.message,
      actions: this.actions,
      externalUrl: generateStripeDashboardUrl(this.stripePaymentIntentId, this.stripeEnv),
    });

    return Response.json(typeSafeResponse, { status: this.statusCode });
  }
}

class CancelFailure extends SuccessWebhookResponse {
  readonly result = "CANCEL_FAILURE";
  readonly actions = ["CANCEL"] as const;
  readonly error: StripeCancelPaymentIntentAPIError;

  readonly stripePaymentIntentId: StripePaymentIntentId;
  readonly saleorEventAmount: number;
  readonly stripeEnv: StripeEnv;

  constructor(args: {
    saleorEventAmount: number;
    stripePaymentIntentId: StripePaymentIntentId;
    error: StripeCapturePaymentIntentAPIError;
    stripeEnv: StripeEnv;
  }) {
    super();
    this.stripePaymentIntentId = args.stripePaymentIntentId;
    this.saleorEventAmount = args.saleorEventAmount;
    this.error = args.error;
    this.stripeEnv = args.stripeEnv;
  }

  getResponse(): Response {
    const typeSafeResponse = buildSyncWebhookResponsePayload<"TRANSACTION_CANCELATION_REQUESTED">({
      result: this.result,
      pspReference: this.stripePaymentIntentId,
      amount: this.saleorEventAmount,
      message: this.error.merchantMessage,
      actions: this.actions,
      externalUrl: generateStripeDashboardUrl(this.stripePaymentIntentId, this.stripeEnv),
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
