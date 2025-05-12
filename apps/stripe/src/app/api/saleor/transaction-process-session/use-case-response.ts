import { buildSyncWebhookResponsePayload } from "@saleor/app-sdk/handlers/shared";
import { z } from "zod";

import { SaleorMoney } from "@/modules/saleor/saleor-money";
import { createFailureWebhookResponseDataSchema } from "@/modules/saleor/saleor-webhook-response-schema";
import { SuccessWebhookResponse } from "@/modules/saleor/saleor-webhook-responses";
import { generateStripeDashboardUrl } from "@/modules/stripe/generate-stripe-dashboard-url";
import {
  StripeApiError,
  StripeApiErrorPublicCode,
  StripeCardErrorPublicCode,
} from "@/modules/stripe/stripe-api-error";
import {
  AuthorizationActionRequiredResult,
  ChargeActionRequiredResult,
} from "@/modules/transaction-result/action-required-result";
import {
  AuthorizationFailureResult,
  ChargeFailureResult,
} from "@/modules/transaction-result/failure-result";
import {
  AuthorizationRequestResult,
  ChargeRequestResult,
} from "@/modules/transaction-result/request-result";
import {
  AuthorizationSuccessResult,
  ChargeSuccessResult,
} from "@/modules/transaction-result/success-result";

type TransactionResult =
  | ChargeSuccessResult
  | AuthorizationSuccessResult
  | ChargeActionRequiredResult
  | AuthorizationActionRequiredResult
  | ChargeRequestResult
  | AuthorizationRequestResult;

class Success extends SuccessWebhookResponse {
  readonly transactionResult: TransactionResult;
  readonly saleorMoney: SaleorMoney;
  readonly date: Date | null;

  constructor(args: {
    transactionResult: TransactionResult;
    saleorMoney: SaleorMoney;
    date: Date | null;
  }) {
    super();
    this.transactionResult = args.transactionResult;
    this.saleorMoney = args.saleorMoney;
    this.date = args.date;
  }

  getResponse(): Response {
    const typeSafeResponse = buildSyncWebhookResponsePayload<"TRANSACTION_PROCESS_SESSION">({
      result: this.transactionResult.result,
      amount: this.saleorMoney.amount,
      pspReference: this.transactionResult.stripePaymentIntentId,
      // https://docs.stripe.com/payments/paymentintents/lifecycle
      message: this.transactionResult.message,
      actions: this.transactionResult.actions,
      externalUrl: generateStripeDashboardUrl(
        this.transactionResult.stripePaymentIntentId,
        this.transactionResult.stripeEnv,
      ),
      time: this.date?.toISOString(),
    });

    return Response.json(typeSafeResponse, { status: this.statusCode });
  }
}

class Failure extends SuccessWebhookResponse {
  readonly transactionResult: ChargeFailureResult | AuthorizationFailureResult;
  readonly error: StripeApiError;
  readonly saleorEventAmount: number;

  private static ResponseDataSchema = createFailureWebhookResponseDataSchema(
    z.array(
      z.object({
        code: z.union([z.literal(StripeCardErrorPublicCode), z.literal(StripeApiErrorPublicCode)]),
        message: z.string(),
      }),
    ),
  );

  constructor(args: {
    transactionResult: ChargeFailureResult | AuthorizationFailureResult;
    error: StripeApiError;
    saleorEventAmount: number;
  }) {
    super();
    this.transactionResult = args.transactionResult;
    this.error = args.error;
    this.saleorEventAmount = args.saleorEventAmount;
  }

  getResponse() {
    const typeSafeResponse = buildSyncWebhookResponsePayload<"TRANSACTION_PROCESS_SESSION">({
      result: this.transactionResult.result,
      message: this.error.merchantMessage,
      amount: this.saleorEventAmount,
      pspReference: this.transactionResult.stripePaymentIntentId,
      externalUrl: generateStripeDashboardUrl(
        this.transactionResult.stripePaymentIntentId,
        this.transactionResult.stripeEnv,
      ),
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
      actions: this.transactionResult.actions,
    });

    return Response.json(typeSafeResponse, { status: this.statusCode });
  }
}

export const TransactionProcessSessionUseCaseResponses = {
  Success,
  Failure,
};

export type TransactionProcessSessionUseCaseResponsesType = InstanceType<
  | typeof TransactionProcessSessionUseCaseResponses.Success
  | typeof TransactionProcessSessionUseCaseResponses.Failure
>;
