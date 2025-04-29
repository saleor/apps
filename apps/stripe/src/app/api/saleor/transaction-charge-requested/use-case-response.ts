import { buildSyncWebhookResponsePayload } from "@saleor/app-sdk/handlers/shared";

import { SaleorMoney } from "@/modules/saleor/saleor-money";
import { SuccessWebhookResponse } from "@/modules/saleor/saleor-webhook-responses";
import { StripeCapturePaymentIntentAPIError } from "@/modules/stripe/stripe-payment-intent-api-error";
import { StripePaymentIntentId } from "@/modules/stripe/stripe-payment-intent-id";

class ChargeSuccess extends SuccessWebhookResponse {
  readonly result = "CHARGE_SUCCESS";
  readonly actions = []; // TODO: figure out what actions are available here
  readonly message = "Payment intent sucessfully charged";

  readonly saleorMoney: SaleorMoney;
  readonly stripePaymentIntentId: StripePaymentIntentId;

  constructor(args: { saleorMoney: SaleorMoney; stripePaymentIntentId: StripePaymentIntentId }) {
    super();
    this.saleorMoney = args.saleorMoney;
    this.stripePaymentIntentId = args.stripePaymentIntentId;
  }

  getResponse(): Response {
    const typeSafeResponse = buildSyncWebhookResponsePayload<"TRANSACTION_CHARGE_REQUESTED">({
      result: this.result,
      amount: this.saleorMoney.amount,
      pspReference: this.stripePaymentIntentId,
      message: this.message,
      actions: this.actions,
    });

    return Response.json(typeSafeResponse, { status: this.statusCode });
  }
}

class ChargeFailure extends SuccessWebhookResponse {
  readonly result = "CHARGE_FAILURE";
  readonly actions = ["CHARGE"];
  readonly error: StripeCapturePaymentIntentAPIError;

  readonly stripePaymentIntentId: StripePaymentIntentId;
  readonly saleorEventAmount: number;

  constructor(args: {
    saleorEventAmount: number;
    stripePaymentIntentId: StripePaymentIntentId;
    error: StripeCapturePaymentIntentAPIError;
  }) {
    super();
    this.stripePaymentIntentId = args.stripePaymentIntentId;
    // TODO: remove this after Saleor allows to amount to be optional
    this.saleorEventAmount = args.saleorEventAmount;
    this.error = args.error;
  }

  getResponse(): Response {
    const typeSafeResponse = buildSyncWebhookResponsePayload<"TRANSACTION_CHARGE_REQUESTED">({
      result: this.result,
      pspReference: this.stripePaymentIntentId,
      amount: this.saleorEventAmount,
      message: this.error.merchantMessage,
      // @ts-expect-error TODO: this is a workaround for the type error - remove after we update app-sdk
      actions: this.actions,
    });

    return Response.json(typeSafeResponse, { status: this.statusCode });
  }
}

export const TransactionChargeRequestedUseCaseResponses = {
  ChargeSuccess,
  ChargeFailure,
};

export type TransactionChargeRequestedUseCaseResponsesType = InstanceType<
  (typeof TransactionChargeRequestedUseCaseResponses)[keyof typeof TransactionChargeRequestedUseCaseResponses]
>;
