import { buildSyncWebhookResponsePayload } from "@saleor/app-sdk/handlers/shared";
import { z } from "zod";

import { createFailureWebhookResponseDataSchema } from "@/modules/saleor/saleor-webhook-response-schema";
import { SuccessWebhookResponse } from "@/modules/saleor/saleor-webhook-responses";
import {
  StripeApiErrorPublicCode,
  StripeCardErrorPublicCode,
  StripeGetPaymentIntentAPIError,
} from "@/modules/stripe/stripe-payment-intent-api-error";
import {
  AuthorizationErrorResult,
  ChargeErrorResult,
} from "@/modules/transaction-result/error-result";
import { TransactionResult } from "@/modules/transaction-result/types";

class OK extends SuccessWebhookResponse {
  readonly transactionResult: TransactionResult;

  constructor(args: { transactionResult: TransactionResult }) {
    super();
    this.transactionResult = args.transactionResult;
  }

  getResponse(): Response {
    const typeSafeResponse = buildSyncWebhookResponsePayload<"TRANSACTION_PROCESS_SESSION">({
      result: this.transactionResult.result,
      amount: this.transactionResult.saleorMoney.amount,
      pspReference: this.transactionResult.stripePaymentIntentId,
      // https://docs.stripe.com/payments/paymentintents/lifecycle
      message: this.transactionResult.message,
      // @ts-expect-error TODO: this is a workaround for the type error - remove after we update app-sdk
      actions: this.transactionResult.actions,
      // todo resolve url
    });

    return Response.json(typeSafeResponse, { status: this.statusCode });
  }
}

class Error extends SuccessWebhookResponse {
  readonly transactionResult: ChargeErrorResult | AuthorizationErrorResult;
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
    transactionResult: ChargeErrorResult | AuthorizationErrorResult;
    error: StripeGetPaymentIntentAPIError;
  }) {
    super();
    this.transactionResult = args.transactionResult;
    this.error = args.error;
  }

  getResponse() {
    const typeSafeResponse = buildSyncWebhookResponsePayload<"TRANSACTION_PROCESS_SESSION">({
      result: this.transactionResult.result,
      message: this.error.merchantMessage,
      amount: this.transactionResult.saleorEventAmount,
      pspReference: this.transactionResult.stripePaymentIntentId,
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
