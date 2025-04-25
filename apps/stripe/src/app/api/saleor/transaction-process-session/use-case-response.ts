import { buildSyncWebhookResponsePayload } from "@saleor/app-sdk/handlers/shared";
import { z } from "zod";

import { AuthorizationErrorResult, ChargeErrorResult } from "@/modules/app-result/error-result";
import { AppResult } from "@/modules/app-result/types";
import { createFailureWebhookResponseDataSchema } from "@/modules/saleor/saleor-webhook-response-schema";
import { SuccessWebhookResponse } from "@/modules/saleor/saleor-webhook-responses";
import {
  StripeApiErrorPublicCode,
  StripeCardErrorPublicCode,
  StripeGetPaymentIntentAPIError,
} from "@/modules/stripe/stripe-payment-intent-api-error";

class OK extends SuccessWebhookResponse {
  readonly appResult: AppResult;

  constructor(args: { appResult: AppResult }) {
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
      // @ts-expect-error TODO: this is a workaround for the type error - remove after we update app-sdk
      actions: this.appResult.actions,
    });

    return Response.json(typeSafeResponse, { status: this.statusCode });
  }
}

class Error extends SuccessWebhookResponse {
  readonly appResult: ChargeErrorResult | AuthorizationErrorResult;
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
    appResult: ChargeErrorResult | AuthorizationErrorResult;
    error: StripeGetPaymentIntentAPIError;
  }) {
    super();
    this.appResult = args.appResult;
    this.error = args.error;
  }

  getResponse() {
    const typeSafeResponse = buildSyncWebhookResponsePayload<"TRANSACTION_PROCESS_SESSION">({
      result: this.appResult.result,
      message: this.error.merchantMessage,
      amount: this.appResult.saleorEventAmount,
      pspReference: this.appResult.stripePaymentIntentId,
      data: Error.ResponseDataSchema.parse({
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

export const TransactionProcessSessionUseCaseResponses = {
  OK,
  Error,
};

export type TransactionProcessSessionUseCaseResponsesType = InstanceType<
  (typeof TransactionProcessSessionUseCaseResponses)[keyof typeof TransactionProcessSessionUseCaseResponses]
>;
