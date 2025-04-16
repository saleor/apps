import { buildSyncWebhookResponsePayload } from "@saleor/app-sdk/handlers/shared";
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
import { StripePaymentIntentId } from "@/modules/stripe/stripe-payment-intent-id";
import { StripePaymentIntentsApi } from "@/modules/stripe/stripe-payment-intents-api";

import { TransactionInitializeSessionEventDataError } from "./event-data-parser";

// TODO: add support for other results e.g AUTHORIZE

class ChargeActionRequired extends SuccessWebhookResponse {
  readonly result = "CHARGE_ACTION_REQUIRED" as const;
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
    // TODO: fix typing of buildSyncWebhookResponsePayload - it doesn't allow actions etc.
    const typeSafeResponse = buildSyncWebhookResponsePayload<"TRANSACTION_INITIALIZE_SESSION">({
      data: ChargeActionRequired.ResponseDataSchema.parse({
        paymentIntent: {
          stripeClientSecret: this.stripeClientSecret,
        },
      }),
      result: this.result,
      amount: this.saleorMoney.amount,
      pspReference: this.stripePaymentIntentId,
    });

    return Response.json(typeSafeResponse, { status: this.statusCode });
  }
}

class ChargeFailure extends SuccessWebhookResponse {
  readonly result = "CHARGE_FAILURE" as const;
  readonly message: string;
  readonly error:
    | TransactionInitializeSessionEventDataError
    | InstanceType<typeof StripePaymentIntentsApi.CreatePaymentIntentError>;
  readonly saleorEventAmount: number;

  private static ResponseDataSchema = createFailureWebhookResponseDataSchema(
    z.array(
      z.object({
        code: z.union([
          z.literal("UnsupportedPaymentMethodError"),
          z.literal("BadRequestError"),
          z.literal("StripeCreatePaymentIntentError"),
        ]),
        message: z.string(),
      }),
    ),
  );

  constructor(args: {
    message: string;
    error:
      | TransactionInitializeSessionEventDataError
      | InstanceType<typeof StripePaymentIntentsApi.CreatePaymentIntentError>;
    saleorEventAmount: number;
  }) {
    super();
    this.message = args.message;
    this.error = args.error;
    // TODO: remove this after Saleor allows to amount to be optional
    this.saleorEventAmount = args.saleorEventAmount;
  }

  getResponse() {
    const typeSafeResponse = buildSyncWebhookResponsePayload<"TRANSACTION_INITIALIZE_SESSION">({
      result: this.result,
      message: this.message,
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

export const TransactionInitalizeSessionUseCaseResponses = {
  ChargeActionRequired,
  ChargeFailure,
};

export type TransactionInitalizeSessionUseCaseResponsesType = InstanceType<
  (typeof TransactionInitalizeSessionUseCaseResponses)[keyof typeof TransactionInitalizeSessionUseCaseResponses]
>;
