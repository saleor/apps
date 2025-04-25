import { buildSyncWebhookResponsePayload } from "@saleor/app-sdk/handlers/shared";

import { BaseError } from "@/lib/errors";
import { SaleorMoney } from "@/modules/saleor/saleor-money";
import { StripePaymentIntentId } from "@/modules/stripe/stripe-payment-intent-id";

abstract class RequestResult {
  abstract result: "CHARGE_REQUEST" | "AUTHORIZATION_REQUEST";
  readonly saleorMoney: SaleorMoney;
  readonly stripePaymentIntentId: StripePaymentIntentId;

  constructor(args: { saleorMoney: SaleorMoney; stripePaymentIntentId: StripePaymentIntentId }) {
    this.saleorMoney = args.saleorMoney;
    this.stripePaymentIntentId = args.stripePaymentIntentId;
  }

  getResponse() {
    const typeSafeResponse = buildSyncWebhookResponsePayload<"TRANSACTION_PROCESS_SESSION">({
      result: this.result,
      amount: this.saleorMoney.amount,
      pspReference: this.stripePaymentIntentId,
      message: "Payment intent is processing",
    });

    return Response.json(typeSafeResponse, { status: 200 });
  }

  getTransactionEventReportVariables() {
    // TODO: add implementation when handling Stripe webhook
    throw new BaseError("Not implemented");
  }
}

export class ChargeRequestResult extends RequestResult {
  readonly result = "CHARGE_REQUEST";
}

export class AuthorizationRequestResult extends RequestResult {
  readonly result = "AUTHORIZATION_REQUEST";
}

abstract class FailureForCancelledPaymentIntentRequest {
  abstract result: "CHARGE_FAILURE" | "AUTHORIZATION_FAILURE";
  readonly saleorMoney: SaleorMoney;
  readonly stripePaymentIntentId: StripePaymentIntentId;

  constructor(args: { saleorMoney: SaleorMoney; stripePaymentIntentId: StripePaymentIntentId }) {
    // TODO: remove this after Saleor allows to amount to be optional
    this.saleorMoney = args.saleorMoney;
    this.stripePaymentIntentId = args.stripePaymentIntentId;
  }

  getResponse() {
    const typeSafeResponse = buildSyncWebhookResponsePayload<"TRANSACTION_PROCESS_SESSION">({
      result: this.result,
      message: "Payment intent was cancelled",
      amount: this.saleorMoney.amount,
      pspReference: this.stripePaymentIntentId,
    });

    return Response.json(typeSafeResponse, { status: 200 });
  }

  getTransactionEventReportVariables() {
    // TODO: add implementation when handling Stripe webhook
    throw new BaseError("Not implemented");
  }
}

export class ChargeFailureForCancelledPaymentIntentResult extends FailureForCancelledPaymentIntentRequest {
  readonly result = "CHARGE_FAILURE";
}

export class AuthorizationFailureForCancelledPaymentIntentResult extends FailureForCancelledPaymentIntentRequest {
  readonly result = "AUTHORIZATION_FAILURE";
}
