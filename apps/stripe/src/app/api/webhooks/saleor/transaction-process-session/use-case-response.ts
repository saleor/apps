import { buildSyncWebhookResponsePayload } from "@saleor/app-sdk/handlers/shared";
import { z } from "zod";

import { createFailureWebhookResponseDataSchema } from "@/app/api/webhooks/saleor/saleor-webhook-response-schema";
import { SuccessWebhookResponse } from "@/app/api/webhooks/saleor/saleor-webhook-responses";
import { AppContext } from "@/lib/app-context";
import { BaseError } from "@/lib/errors";
import { SaleorMoney } from "@/modules/saleor/saleor-money";
import { generatePaymentIntentStripeDashboardUrl } from "@/modules/stripe/generate-stripe-dashboard-urls";
import {
  StripeApiError,
  StripeApiErrorPublicCode,
  StripeCardErrorPublicCode,
} from "@/modules/stripe/stripe-api-error";
import { StripePaymentIntentId } from "@/modules/stripe/stripe-payment-intent-id";
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
  readonly timestamp: Date | null;
  readonly stripePaymentIntentId: StripePaymentIntentId;

  constructor(args: {
    transactionResult: TransactionResult;
    saleorMoney: SaleorMoney;
    timestamp: Date | null;
    stripePaymentIntentId: StripePaymentIntentId;
    appContext: AppContext;
  }) {
    super(args.appContext);
    this.transactionResult = args.transactionResult;
    this.saleorMoney = args.saleorMoney;
    this.timestamp = args.timestamp;
    this.stripePaymentIntentId = args.stripePaymentIntentId;
  }

  getResponse(): Response {
    if (!this.appContext.stripeEnv) {
      throw new BaseError("Stripe environment is not set. Ensure AppContext is set earlier");
    }

    const typeSafeResponse = buildSyncWebhookResponsePayload<"TRANSACTION_PROCESS_SESSION">({
      // https://docs.stripe.com/payments/paymentintents/lifecycle
      result: this.transactionResult.result,
      amount: this.saleorMoney.amount,
      pspReference: this.stripePaymentIntentId,
      message: this.messageFormatter.formatMessage(this.transactionResult.message),
      actions: this.transactionResult.actions,
      externalUrl: generatePaymentIntentStripeDashboardUrl(
        this.stripePaymentIntentId,
        this.appContext.stripeEnv,
      ),
      time: this.timestamp?.toISOString(),
    });

    return Response.json(typeSafeResponse, { status: this.statusCode });
  }
}

class Failure extends SuccessWebhookResponse {
  readonly transactionResult: ChargeFailureResult | AuthorizationFailureResult;
  readonly error: StripeApiError;
  readonly saleorEventAmount: number;
  readonly stripePaymentIntentId: StripePaymentIntentId;

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
    stripePaymentIntentId: StripePaymentIntentId;
    appContext: AppContext;
  }) {
    super(args.appContext);
    this.transactionResult = args.transactionResult;
    this.error = args.error;
    this.saleorEventAmount = args.saleorEventAmount;
    this.stripePaymentIntentId = args.stripePaymentIntentId;
  }

  getResponse() {
    if (!this.appContext.stripeEnv) {
      throw new BaseError("Stripe environment is not set. Ensure AppContext is set earlier");
    }

    const typeSafeResponse = buildSyncWebhookResponsePayload<"TRANSACTION_PROCESS_SESSION">({
      result: this.transactionResult.result,
      message: this.messageFormatter.formatMessage(this.error.merchantMessage, this.error),
      amount: this.saleorEventAmount,
      pspReference: this.stripePaymentIntentId,
      externalUrl: generatePaymentIntentStripeDashboardUrl(
        this.stripePaymentIntentId,
        this.appContext.stripeEnv,
      ),
      data: Failure.ResponseDataSchema.parse({
        paymentIntent: {
          errors: [
            {
              code: this.error.publicCode,
              message: this.messageFormatter.formatMessage(this.error.publicMessage, this.error),
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
