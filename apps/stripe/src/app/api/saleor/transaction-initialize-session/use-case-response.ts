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
  StripePaymentIntentAPIError,
} from "@/modules/stripe/stripe-payment-intent-api-error";
import { StripePaymentIntentId } from "@/modules/stripe/stripe-payment-intent-id";

import {
  ParseErrorPublicCode,
  TransactionInitializeSessionEventDataError,
  UnsupportedPaymentMethodErrorPublicCode,
} from "./event-data-parser";

type ReponseResult = SyncWebhookResponsesMap["TRANSACTION_INITIALIZE_SESSION"]["result"];

class ChargeActionRequired extends SuccessWebhookResponse {
  readonly result: ReponseResult = "CHARGE_ACTION_REQUIRED";
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
      // this.result now correctly matches the expected union type
      result: this.result,
      amount: this.saleorMoney.amount,
      pspReference: this.stripePaymentIntentId,
      // https://docs.stripe.com/payments/paymentintents/lifecycle
      message: "Payment intent requires payment method",
    });

    return Response.json(typeSafeResponse, { status: this.statusCode });
  }
}

class AuthorizationActionRequired extends ChargeActionRequired {
  readonly result: ReponseResult = "AUTHORIZATION_ACTION_REQUIRED";
}

class ChargeFailure extends SuccessWebhookResponse {
  readonly result: ReponseResult = "CHARGE_FAILURE";
  readonly error: StripePaymentIntentAPIError | TransactionInitializeSessionEventDataError;
  readonly saleorEventAmount: number;

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
    error: StripePaymentIntentAPIError | TransactionInitializeSessionEventDataError;
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
    });

    return Response.json(typeSafeResponse, { status: this.statusCode });
  }
}

class AuthorizationFailure extends ChargeFailure {
  readonly result: ReponseResult = "AUTHORIZATION_FAILURE";
}

export const TransactionInitalizeSessionUseCaseResponses = {
  ChargeActionRequired,
  AuthorizationActionRequired,
  ChargeFailure,
  AuthorizationFailure,
};

export type TransactionInitalizeSessionUseCaseResponsesType = InstanceType<
  (typeof TransactionInitalizeSessionUseCaseResponses)[keyof typeof TransactionInitalizeSessionUseCaseResponses]
>;
