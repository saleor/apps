import {
  buildSyncWebhookResponsePayload,
  SyncWebhookResponsesMap,
} from "@saleor/app-sdk/handlers/shared";
import { z } from "zod";

import { SaleorMoney } from "@/modules/saleor/saleor-money";
import { createFailureWebhookResponseDataSchema } from "@/modules/saleor/saleor-webhook-response-schema";
import { SuccessWebhookResponse } from "@/modules/saleor/saleor-webhook-responses";
import {
  StripeApiErrorPublicCode,
  StripeCardErrorPublicCode,
  StripeGetPaymentIntentAPIError,
} from "@/modules/stripe/stripe-payment-intent-api-error";
import { StripePaymentIntentId } from "@/modules/stripe/stripe-payment-intent-id";
import { StripePaymentIntentStatus } from "@/modules/stripe/stripe-payment-intent.status";

type ResponseResult = SyncWebhookResponsesMap["TRANSACTION_PROCESS_SESSION"]["result"];

class ChargeSuccess extends SuccessWebhookResponse {
  readonly result: ResponseResult = "CHARGE_SUCCESS";
  readonly saleorMoney: SaleorMoney;
  readonly stripePaymentIntentId: StripePaymentIntentId;

  constructor(args: { saleorMoney: SaleorMoney; stripePaymentIntentId: StripePaymentIntentId }) {
    super();
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

    return Response.json(typeSafeResponse, { status: this.statusCode });
  }
}

class AuthorizationSuccess extends ChargeSuccess {
  readonly result: ResponseResult = "AUTHORIZATION_SUCCESS";
}

class ChargeActionRequired extends SuccessWebhookResponse {
  readonly result: ResponseResult = "CHARGE_ACTION_REQUIRED";
  readonly saleorMoney: SaleorMoney;
  readonly stripeStatus: StripePaymentIntentStatus;
  readonly stripePaymentIntentId: StripePaymentIntentId;

  constructor(args: {
    saleorMoney: SaleorMoney;
    stripePaymentIntentId: StripePaymentIntentId;
    stripeStatus: StripePaymentIntentStatus;
  }) {
    super();
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

    return Response.json(typeSafeResponse, { status: this.statusCode });
  }
}

class AuthorizationActionRequired extends ChargeActionRequired {
  readonly result: ResponseResult = "AUTHORIZATION_ACTION_REQUIRED";
}

class ChargeRequest extends SuccessWebhookResponse {
  readonly result: ResponseResult = "CHARGE_REQUEST";
  readonly saleorMoney: SaleorMoney;
  readonly stripePaymentIntentId: StripePaymentIntentId;

  constructor(args: { saleorMoney: SaleorMoney; stripePaymentIntentId: StripePaymentIntentId }) {
    super();
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

    return Response.json(typeSafeResponse, { status: this.statusCode });
  }
}

class AuthorizationRequest extends ChargeRequest {
  readonly result: ResponseResult = "AUTHORIZATION_REQUEST";
}

class ChargeFailure extends SuccessWebhookResponse {
  readonly result: ResponseResult = "CHARGE_FAILURE";
  readonly saleorEventAmount: number;
  readonly stripePaymentIntentId: StripePaymentIntentId;
  readonly error: StripeGetPaymentIntentAPIError;

  private static ResponseDataSchema = createFailureWebhookResponseDataSchema(
    z.array(
      z.object({
        code: z.union([
          z.literal(StripeCardErrorPublicCode),
          z.literal(StripeApiErrorPublicCode),
          z.literal("PaymentIntentCancelledError"),
        ]),
        message: z.string(),
      }),
    ),
  );

  constructor(args: {
    saleorEventAmount: number;
    stripePaymentIntentId: StripePaymentIntentId;
    error: StripeGetPaymentIntentAPIError;
  }) {
    super();
    // TODO: remove this after Saleor allows to amount to be optional
    this.saleorEventAmount = args.saleorEventAmount;
    this.stripePaymentIntentId = args.stripePaymentIntentId;
    this.error = args.error;
  }

  getResponse() {
    const typeSafeResponse = buildSyncWebhookResponsePayload<"TRANSACTION_PROCESS_SESSION">({
      result: this.result,
      message: this.error.merchantMessage,
      amount: this.saleorEventAmount,
      pspReference: this.stripePaymentIntentId,
      data: ChargeFailure.ResponseDataSchema.parse({
        paymentIntent: {
          errors: [
            {
              code: this.error.publicCode,
              message: this.error.publicMessage,
            },
          ],
        },
      }),
    });

    return Response.json(typeSafeResponse, { status: this.statusCode });
  }
}

class AuthorizationFailure extends ChargeFailure {
  readonly result: ResponseResult = "AUTHORIZATION_FAILURE";
}

class ChargeFailureForCancelledPaymentIntent extends SuccessWebhookResponse {
  readonly result: ResponseResult = "CHARGE_FAILURE";
  readonly saleorMoney: SaleorMoney;
  readonly stripePaymentIntentId: StripePaymentIntentId;

  constructor(args: { saleorMoney: SaleorMoney; stripePaymentIntentId: StripePaymentIntentId }) {
    super();
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

    return Response.json(typeSafeResponse, { status: this.statusCode });
  }
}

class AuthorizationFailureForCancelledPaymentIntent extends ChargeFailureForCancelledPaymentIntent {
  readonly result: ResponseResult = "AUTHORIZATION_FAILURE";
}

export const TransactionProcessSessionUseCaseResponses = {
  ChargeSuccess,
  AuthorizationSuccess,
  ChargeActionRequired,
  AuthorizationActionRequired,
  ChargeFailure,
  AuthorizationFailure,
  ChargeRequest,
  AuthorizationRequest,
  ChargeFailureForCancelledPaymentIntent,
  AuthorizationFailureForCancelledPaymentIntent,
};

export type TransactionProcessSessionUseCaseResponsesType = InstanceType<
  (typeof TransactionProcessSessionUseCaseResponses)[keyof typeof TransactionProcessSessionUseCaseResponses]
>;
