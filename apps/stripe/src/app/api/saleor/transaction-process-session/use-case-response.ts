import { buildSyncWebhookResponsePayload } from "@saleor/app-sdk/handlers/shared";
import { z } from "zod";

import { createFailureWebhookResponseDataSchema } from "@/modules/saleor/saleor-webhook-response-schema";
import { SuccessWebhookResponse } from "@/modules/saleor/saleor-webhook-responses";
import {
  AuthorizationActionRequiredResult,
  AuthorizationSuccessResult,
  ChargeActionRequiredResult,
  ChargeFailureForCancelledPaymentIntentResult,
  ChargeRequestResult,
  ChargeSuccessResult,
} from "@/modules/stripe/payment-intent-handling-results";
import {
  StripeApiErrorPublicCode,
  StripeCardErrorPublicCode,
  StripeGetPaymentIntentAPIError,
} from "@/modules/stripe/stripe-payment-intent-api-error";
import { StripePaymentIntentId } from "@/modules/stripe/stripe-payment-intent-id";

abstract class FailureBase extends SuccessWebhookResponse {
  readonly result = "" as "CHARGE_FAILURE" | "AUTHORIZATION_FAILURE";
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
  ChargeSuccess: ChargeSuccessResult,
  AuthorizationSuccess: AuthorizationSuccessResult,
  ChargeActionRequired: ChargeActionRequiredResult,
  AuthorizationActionRequired: AuthorizationActionRequiredResult,
  ChargeFailure,
  AuthorizationFailure,
  ChargeRequest: ChargeRequestResult,
  AuthorizationRequest: AuthorizationActionRequiredResult,
  ChargeFailureForCancelledPaymentIntent: ChargeFailureForCancelledPaymentIntentResult,
  AuthorizationFailureForCancelledPaymentIntent: ChargeFailureForCancelledPaymentIntentResult,
};

export type TransactionProcessSessionUseCaseResponsesType = InstanceType<
  (typeof TransactionProcessSessionUseCaseResponses)[keyof typeof TransactionProcessSessionUseCaseResponses]
>;
