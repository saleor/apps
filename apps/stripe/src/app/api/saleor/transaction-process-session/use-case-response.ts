import { buildSyncWebhookResponsePayload } from "@saleor/app-sdk/handlers/shared";
import { z } from "zod";

import { PaymentIntentResult } from "@/modules/saleor/payment-intent-result/types";
import { createFailureWebhookResponseDataSchema } from "@/modules/saleor/saleor-webhook-response-schema";
import { SuccessWebhookResponse } from "@/modules/saleor/saleor-webhook-responses";
import { ChargeFailureForCancelledPaymentIntentResult } from "@/modules/stripe/payment-intent-handling-results";
import {
  StripeApiErrorPublicCode,
  StripeCardErrorPublicCode,
  StripeGetPaymentIntentAPIError,
} from "@/modules/stripe/stripe-payment-intent-api-error";
import { StripePaymentIntentId } from "@/modules/stripe/stripe-payment-intent-id";

class Success extends SuccessWebhookResponse {
  readonly appResult: PaymentIntentResult;

  constructor(args: { appResult: PaymentIntentResult }) {
    super();
    this.appResult = args.appResult;
  }

  getResponse(): Response {
    const typeSafeResponse = buildSyncWebhookResponsePayload<"TRANSACTION_PROCESS_SESSION">({
      result: this.appResult.result,
      amount: this.appResult.saleorMoney.amount,
      pspReference: this.appResult.stripePaymentIntentId,
      // https://docs.stripe.com/payments/paymentintents/lifecycle
      message: this.appResult.message,
      // @ts-expect-error - this is a workaround for the type error
      actions: this.appResult.actions,
    });

    return Response.json(typeSafeResponse, { status: this.statusCode });
  }
}

abstract class FailureBase extends SuccessWebhookResponse {
  abstract result: "CHARGE_FAILURE" | "AUTHORIZATION_FAILURE";
  readonly saleorEventAmount: number;
  readonly stripePaymentIntentId: StripePaymentIntentId;
  readonly error: StripeGetPaymentIntentAPIError;

  private static ResponseDataSchema = createFailureWebhookResponseDataSchema(
    z.array(
      z.object({
        code: z.union([z.literal(StripeCardErrorPublicCode), z.literal(StripeApiErrorPublicCode)]),
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
      data: FailureBase.ResponseDataSchema.parse({
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

class ChargeFailure extends FailureBase {
  readonly result = "CHARGE_FAILURE";
}

class AuthorizationFailure extends FailureBase {
  readonly result = "AUTHORIZATION_FAILURE";
}

export const TransactionProcessSessionUseCaseResponses = {
  Success,
  ChargeFailure,
  AuthorizationFailure,
  ChargeFailureForCancelledPaymentIntent: ChargeFailureForCancelledPaymentIntentResult,
  AuthorizationFailureForCancelledPaymentIntent: ChargeFailureForCancelledPaymentIntentResult,
};

export type TransactionProcessSessionUseCaseResponsesType = InstanceType<
  (typeof TransactionProcessSessionUseCaseResponses)[keyof typeof TransactionProcessSessionUseCaseResponses]
>;
