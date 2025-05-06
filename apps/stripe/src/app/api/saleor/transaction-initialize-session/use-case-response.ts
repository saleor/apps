import {
  buildSyncWebhookResponsePayload,
  SyncWebhookResponsesMap,
} from "@saleor/app-sdk/handlers/shared";
import { z } from "zod";

import { SaleorMoney } from "@/modules/saleor/saleor-money";
import {
  createFailureWebhookResponseDataSchema,
  createSuccessWebhookResponseDataSchema,
} from "@/modules/saleor/saleor-webhook-response-schema";
import { SuccessWebhookResponse } from "@/modules/saleor/saleor-webhook-responses";
import {
  StripeClientSecret,
  StripeClientSecretSchema,
} from "@/modules/stripe/stripe-client-secret";
import {
  StripeApiErrorPublicCode,
  StripeCardErrorPublicCode,
  StripeCreatePaymentIntentAPIError,
} from "@/modules/stripe/stripe-payment-intent-api-error";
import { StripePaymentIntentId } from "@/modules/stripe/stripe-payment-intent-id";

import {
  ParseErrorPublicCode,
  TransactionInitializeSessionEventDataError,
  UnsupportedPaymentMethodErrorPublicCode,
} from "./event-data-parser";

type ResponseResult = SyncWebhookResponsesMap["TRANSACTION_INITIALIZE_SESSION"]["result"];

// TODO: refactor this to use TransactionResult
class ChargeActionRequired extends SuccessWebhookResponse {
  readonly result: ResponseResult = "CHARGE_ACTION_REQUIRED";
  readonly actions = ["CANCEL"] as const;

  readonly stripeClientSecret: StripeClientSecret;
  readonly saleorMoney: SaleorMoney;
  readonly stripePaymentIntentId: StripePaymentIntentId;

  private static ResponseDataSchema = createSuccessWebhookResponseDataSchema(
    z.object({
      stripeClientSecret: StripeClientSecretSchema,
    }),
  );

  constructor(args: {
    stripeClientSecret: StripeClientSecret;
    saleorMoney: SaleorMoney;
    stripePaymentIntentId: StripePaymentIntentId;
  }) {
    super();
    this.stripeClientSecret = args.stripeClientSecret;
    this.saleorMoney = args.saleorMoney;
    this.stripePaymentIntentId = args.stripePaymentIntentId;
  }

  getResponse() {
    const typeSafeResponse = buildSyncWebhookResponsePayload<"TRANSACTION_INITIALIZE_SESSION">({
      data: ChargeActionRequired.ResponseDataSchema.parse({
        paymentIntent: {
          stripeClientSecret: this.stripeClientSecret,
        },
      }),
      result: this.result,
      amount: this.saleorMoney.amount,
      pspReference: this.stripePaymentIntentId,
      // https://docs.stripe.com/payments/paymentintents/lifecycle
      message: "Payment intent requires payment method",
      actions: this.actions,
    });

    return Response.json(typeSafeResponse, { status: this.statusCode });
  }
}

class AuthorizationActionRequired extends ChargeActionRequired {
  readonly result: ResponseResult = "AUTHORIZATION_ACTION_REQUIRED";
}

class ChargeFailure extends SuccessWebhookResponse {
  readonly result: ResponseResult = "CHARGE_FAILURE";
  readonly error: StripeCreatePaymentIntentAPIError | TransactionInitializeSessionEventDataError;
  readonly saleorEventAmount: number;
  readonly actions = ["CANCEL"] as const;

  private static ResponseDataSchema = createFailureWebhookResponseDataSchema(
    z.array(
      z.object({
        code: z.union([
          z.literal(ParseErrorPublicCode),
          z.literal(UnsupportedPaymentMethodErrorPublicCode),
          z.literal(StripeCardErrorPublicCode),
          z.literal(StripeApiErrorPublicCode),
        ]),
        message: z.string(),
      }),
    ),
  );

  constructor(args: {
    error: StripeCreatePaymentIntentAPIError | TransactionInitializeSessionEventDataError;
    saleorEventAmount: number;
  }) {
    super();
    this.error = args.error;
    // TODO: remove this after Saleor allows to amount to be optional
    this.saleorEventAmount = args.saleorEventAmount;
  }

  getResponse() {
    const typeSafeResponse = buildSyncWebhookResponsePayload<"TRANSACTION_INITIALIZE_SESSION">({
      result: this.result,
      message: this.error.merchantMessage,
      amount: this.saleorEventAmount,
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
      actions: this.actions,
    });

    return Response.json(typeSafeResponse, { status: this.statusCode });
  }
}

// todo refactor, this is confusing, extract base class instead Failure extending Success
class AuthorizationFailure extends ChargeFailure {
  readonly result: ResponseResult = "AUTHORIZATION_FAILURE";
}

export const TransactionInitializeSessionUseCaseResponses = {
  ChargeActionRequired,
  AuthorizationActionRequired,
  ChargeFailure,
  AuthorizationFailure,
};

export type TransactionInitializeSessionUseCaseResponsesType = InstanceType<
  (typeof TransactionInitializeSessionUseCaseResponses)[keyof typeof TransactionInitializeSessionUseCaseResponses]
>;
