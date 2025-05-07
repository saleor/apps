import { buildSyncWebhookResponsePayload } from "@saleor/app-sdk/handlers/shared";
import { z } from "zod";

import { SaleorMoney } from "@/modules/saleor/saleor-money";
import {
  createFailureWebhookResponseDataSchema,
  createSuccessWebhookResponseDataSchema,
} from "@/modules/saleor/saleor-webhook-response-schema";
import { SuccessWebhookResponse } from "@/modules/saleor/saleor-webhook-responses";
import { generateStripeDashboardUrl } from "@/modules/stripe/generate-stripe-dashboard-url";
import {
  StripeClientSecret,
  StripeClientSecretSchema,
} from "@/modules/stripe/stripe-client-secret";
import {
  StripeApiErrorPublicCode,
  StripeCardErrorPublicCode,
  StripeCreatePaymentIntentAPIError,
} from "@/modules/stripe/stripe-payment-intent-api-error";
import {
  AuthorizationActionRequiredResult,
  ChargeActionRequiredResult,
} from "@/modules/transaction-result/action-required-result";

import {
  ParseErrorPublicCode,
  TransactionInitializeSessionEventDataError,
  UnsupportedPaymentMethodErrorPublicCode,
} from "./event-data-parser";
import {
  TransactionInitializeAuthorizationFailureResult,
  TransactionInitializeChargeFailureResult,
} from "./failure-result";

class Success extends SuccessWebhookResponse {
  readonly transactionResult: ChargeActionRequiredResult | AuthorizationActionRequiredResult;
  readonly stripeClientSecret: StripeClientSecret;
  readonly saleorMoney: SaleorMoney;

  private static ResponseDataSchema = createSuccessWebhookResponseDataSchema(
    z.object({
      stripeClientSecret: StripeClientSecretSchema,
    }),
  );

  constructor(args: {
    transactionResult: ChargeActionRequiredResult | AuthorizationActionRequiredResult;
    stripeClientSecret: StripeClientSecret;
    saleorMoney: SaleorMoney;
  }) {
    super();
    this.transactionResult = args.transactionResult;
    this.stripeClientSecret = args.stripeClientSecret;
    this.saleorMoney = args.saleorMoney;
  }

  getResponse() {
    const typeSafeResponse = buildSyncWebhookResponsePayload<"TRANSACTION_INITIALIZE_SESSION">({
      data: Success.ResponseDataSchema.parse({
        paymentIntent: {
          stripeClientSecret: this.stripeClientSecret,
        },
      }),
      result: this.transactionResult.result,
      amount: this.saleorMoney.amount,
      pspReference: this.transactionResult.stripePaymentIntentId,
      // https://docs.stripe.com/payments/paymentintents/lifecycle
      message: "Payment intent requires payment method",
      externalUrl: generateStripeDashboardUrl(
        this.transactionResult.stripePaymentIntentId,
        this.transactionResult.stripeEnv,
      ),
    });

    return Response.json(typeSafeResponse, { status: this.statusCode });
  }
}

class Failure extends SuccessWebhookResponse {
  readonly transactionResult:
    | TransactionInitializeChargeFailureResult
    | TransactionInitializeAuthorizationFailureResult;
  readonly error: StripeCreatePaymentIntentAPIError | TransactionInitializeSessionEventDataError;

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
    transactionResult:
      | TransactionInitializeChargeFailureResult
      | TransactionInitializeAuthorizationFailureResult;
    error: StripeCreatePaymentIntentAPIError | TransactionInitializeSessionEventDataError;
  }) {
    super();
    this.transactionResult = args.transactionResult;
    this.error = args.error;
  }

  getResponse() {
    const typeSafeResponse = buildSyncWebhookResponsePayload<"TRANSACTION_INITIALIZE_SESSION">({
      result: this.transactionResult.result,
      message: this.error.merchantMessage,
      amount: this.transactionResult.saleorEventAmount,
      data: Failure.ResponseDataSchema.parse({
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

export const TransactionInitializeSessionUseCaseResponses = {
  Success,
  Failure,
};

export type TransactionInitializeSessionUseCaseResponsesType = InstanceType<
  (typeof TransactionInitializeSessionUseCaseResponses)[keyof typeof TransactionInitializeSessionUseCaseResponses]
>;
