import { SuccessWebhookResponse } from "@/app/api/webhooks/saleor/saleor-webhook-responses";
import {
  TransactionChargeRequestedSyncFailure,
  TransactionChargeRequestedSyncSuccess,
} from "@/generated/json-schema/transaction-charge-requested";
import { AppContext } from "@/lib/app-context";
import { BaseError } from "@/lib/errors";
import { SaleorMoney } from "@/modules/saleor/saleor-money";
import { generatePaymentIntentStripeDashboardUrl } from "@/modules/stripe/generate-stripe-dashboard-urls";
import { StripeApiError } from "@/modules/stripe/stripe-api-error";
import { StripePaymentIntentId } from "@/modules/stripe/stripe-payment-intent-id";
import { ChargeFailureResult } from "@/modules/transaction-result/failure-result";
import { ChargeSuccessResult } from "@/modules/transaction-result/success-result";

class Success extends SuccessWebhookResponse {
  readonly transactionResult: ChargeSuccessResult;
  readonly saleorMoney: SaleorMoney;
  readonly stripePaymentIntentId: StripePaymentIntentId;

  constructor(args: {
    transactionResult: ChargeSuccessResult;
    saleorMoney: SaleorMoney;
    stripePaymentIntentId: StripePaymentIntentId;
    appContext: AppContext;
  }) {
    super(args.appContext);
    this.transactionResult = args.transactionResult;
    this.saleorMoney = args.saleorMoney;
    this.stripePaymentIntentId = args.stripePaymentIntentId;
  }

  getResponse(): Response {
    if (!this.appContext.stripeEnv) {
      throw new BaseError("Stripe environment is not set. Ensure AppContext is set earlier");
    }

    const typeSafeResponse: TransactionChargeRequestedSyncSuccess = {
      result: this.transactionResult.result,
      amount: this.saleorMoney.amount,
      pspReference: this.stripePaymentIntentId,
      message: this.messageFormatter.formatMessage(this.transactionResult.message),
      actions: this.transactionResult.actions,
      externalUrl: generatePaymentIntentStripeDashboardUrl(
        this.stripePaymentIntentId,
        this.appContext.stripeEnv,
      ),
    };

    return Response.json(typeSafeResponse, { status: this.statusCode });
  }
}

class Failure extends SuccessWebhookResponse {
  readonly transactionResult: ChargeFailureResult;
  readonly error: StripeApiError;
  readonly stripePaymentIntentId: StripePaymentIntentId;

  constructor(args: {
    error: StripeApiError;
    transactionResult: ChargeFailureResult;
    stripePaymentIntentId: StripePaymentIntentId;
    appContext: AppContext;
  }) {
    super(args.appContext);
    this.error = args.error;
    this.transactionResult = args.transactionResult;
    this.stripePaymentIntentId = args.stripePaymentIntentId;
  }

  getResponse(): Response {
    if (!this.appContext.stripeEnv) {
      throw new BaseError("Stripe environment is not set. Ensure AppContext is set earlier");
    }

    const typeSafeResponse: TransactionChargeRequestedSyncFailure = {
      result: this.transactionResult.result,
      pspReference: this.stripePaymentIntentId,
      message: this.messageFormatter.formatMessage(this.transactionResult.message, this.error),
      actions: this.transactionResult.actions,
      externalUrl: generatePaymentIntentStripeDashboardUrl(
        this.stripePaymentIntentId,
        this.appContext.stripeEnv,
      ),
    };

    return Response.json(typeSafeResponse, { status: this.statusCode });
  }
}

export const TransactionChargeRequestedUseCaseResponses = {
  Success,
  Failure,
};

export type TransactionChargeRequestedUseCaseResponsesType = InstanceType<
  | typeof TransactionChargeRequestedUseCaseResponses.Success
  | typeof TransactionChargeRequestedUseCaseResponses.Failure
>;
