import { buildSyncWebhookResponsePayload } from "@saleor/app-sdk/handlers/shared";

import { BaseError } from "@/lib/errors";
import { SaleorMoney } from "@/modules/saleor/saleor-money";
import { StripePaymentIntentId } from "@/modules/stripe/stripe-payment-intent-id";

import { StripePaymentIntentStatus } from "./stripe-payment-intent-status";

abstract class SuccessResult {
  readonly result = "" as "CHARGE_SUCCESS" | "AUTHORIZATION_SUCCESS";
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
      // https://docs.stripe.com/payments/paymentintents/lifecycle
      message: "Payment intent succeeded",
    });

    return Response.json(typeSafeResponse, { status: 200 });
  }

  getTransactionEventReportVariables() {
    // TODO: add implementation when handling Stripe webhook
    throw new BaseError("Not implemented");
  }
}

export class ChargeSuccessResult extends SuccessResult {
  readonly result = "CHARGE_SUCCESS";
}

export class AuthorizationSuccessResult extends SuccessResult {
  readonly result = "AUTHORIZATION_SUCCESS";
}

abstract class ActionRequiredResult {
  readonly result = "" as "CHARGE_ACTION_REQUIRED" | "AUTHORIZATION_ACTION_REQUIRED";
  readonly saleorMoney: SaleorMoney;
  readonly stripeStatus: StripePaymentIntentStatus;
  readonly stripePaymentIntentId: StripePaymentIntentId;

  constructor(args: {
    saleorMoney: SaleorMoney;
    stripePaymentIntentId: StripePaymentIntentId;
    stripeStatus: StripePaymentIntentStatus;
  }) {
    this.stripeStatus = args.stripeStatus;
    this.saleorMoney = args.saleorMoney;
    this.stripePaymentIntentId = args.stripePaymentIntentId;
  }

  private getMessageFromStripeStatus() {
    switch (this.stripeStatus) {
      case "requires_action":
        return "Payment intent requires action";
      case "requires_confirmation":
        return "Payment intent requires confirmation";
      case "requires_payment_method":
        return "Payment intent requires payment method";
    }
  }

  getResponse() {
    const typeSafeResponse = buildSyncWebhookResponsePayload<"TRANSACTION_PROCESS_SESSION">({
      result: this.result,
      amount: this.saleorMoney.amount,
      pspReference: this.stripePaymentIntentId,
      // https://docs.stripe.com/payments/paymentintents/lifecycle
      message: this.getMessageFromStripeStatus(),
    });

    return Response.json(typeSafeResponse, { status: 200 });
  }

  getTransactionEventReportVariables() {
    // TODO: add implementation when handling Stripe webhook
    throw new BaseError("Not implemented");
  }
}

export class ChargeActionRequiredResult extends ActionRequiredResult {
  readonly result = "CHARGE_ACTION_REQUIRED";
}

export class AuthorizationActionRequiredResult extends ActionRequiredResult {
  readonly result = "AUTHORIZATION_ACTION_REQUIRED";
}

abstract class RequestResult {
  readonly result = "" as "CHARGE_REQUEST" | "AUTHORIZATION_REQUEST";
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
  readonly result = "" as "CHARGE_FAILURE" | "AUTHORIZATION_FAILURE";
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
