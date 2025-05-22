import { buildSyncWebhookResponsePayload } from "@saleor/app-sdk/handlers/shared";

import { AppContext } from "@/lib/app-context";
import { SaleorMoney } from "@/modules/saleor/saleor-money";
import { SuccessWebhookResponse } from "@/modules/saleor/saleor-webhook-responses";
import { generatePaymentIntentStripeDashboardUrl } from "@/modules/stripe/generate-stripe-dashboard-urls";
import { StripeApiError } from "@/modules/stripe/stripe-api-error";
import { StripeEnv } from "@/modules/stripe/stripe-env";
import { StripePaymentIntentId } from "@/modules/stripe/stripe-payment-intent-id";
import {
  CancelFailureResult,
  CancelSuccessResult,
} from "@/modules/transaction-result/cancel-result";

class Success extends SuccessWebhookResponse {
  readonly transactionResult: CancelSuccessResult;
  readonly saleorMoney: SaleorMoney;
  readonly timestamp: Date | null;
  readonly stripePaymentIntentId: StripePaymentIntentId;
  readonly stripeEnv: StripeEnv;
  readonly message: string;

  constructor(args: {
    transactionResult: CancelSuccessResult;
    saleorMoney: SaleorMoney;
    timestamp: Date | null;
    stripePaymentIntentId: StripePaymentIntentId;
    stripeEnv: StripeEnv;
    appContext: AppContext;
  }) {
    super(args.appContext);
    this.transactionResult = args.transactionResult;
    this.saleorMoney = args.saleorMoney;
    this.timestamp = args.timestamp;
    this.stripePaymentIntentId = args.stripePaymentIntentId;
    this.stripeEnv = args.stripeEnv;
    this.message = this.transactionResult.message;
  }

  getResponse(): Response {
    const typeSafeResponse = buildSyncWebhookResponsePayload<"TRANSACTION_CANCELATION_REQUESTED">({
      result: this.transactionResult.result,
      amount: this.saleorMoney.amount,
      pspReference: this.stripePaymentIntentId,
      message: this.formatErrorMessage(),
      actions: this.transactionResult.actions,
      externalUrl: generatePaymentIntentStripeDashboardUrl(
        this.stripePaymentIntentId,
        this.stripeEnv,
      ),
      time: this.timestamp?.toISOString(),
    });

    return Response.json(typeSafeResponse, { status: this.statusCode });
  }
}

class Failure extends SuccessWebhookResponse {
  readonly transactionResult: CancelFailureResult;
  readonly error: StripeApiError;
  readonly saleorEventAmount: number;
  readonly stripePaymentIntentId: StripePaymentIntentId;
  readonly stripeEnv: StripeEnv;
  readonly message: string;

  constructor(args: {
    transactionResult: CancelFailureResult;
    error: StripeApiError;
    saleorEventAmount: number;
    stripePaymentIntentId: StripePaymentIntentId;
    stripeEnv: StripeEnv;
    appContext: AppContext;
  }) {
    super(args.appContext, args.error);
    this.transactionResult = args.transactionResult;
    this.error = args.error;
    this.saleorEventAmount = args.saleorEventAmount;
    this.stripePaymentIntentId = args.stripePaymentIntentId;
    this.stripeEnv = args.stripeEnv;
    this.message = this.error.merchantMessage;
  }

  getResponse(): Response {
    const typeSafeResponse = buildSyncWebhookResponsePayload<"TRANSACTION_CANCELATION_REQUESTED">({
      result: this.transactionResult.result,
      pspReference: this.stripePaymentIntentId,
      amount: this.saleorEventAmount,
      message: this.formatErrorMessage(),
      actions: this.transactionResult.actions,
      externalUrl: generatePaymentIntentStripeDashboardUrl(
        this.stripePaymentIntentId,
        this.stripeEnv,
      ),
    });

    return Response.json(typeSafeResponse, { status: this.statusCode });
  }
}

export const TransactionCancelationRequestedUseCaseResponses = {
  Success,
  Failure,
};

export type TransactionCancelationRequestedUseCaseResponsesType = InstanceType<
  | typeof TransactionCancelationRequestedUseCaseResponses.Success
  | typeof TransactionCancelationRequestedUseCaseResponses.Failure
>;
