import { buildSyncWebhookResponsePayload } from "@saleor/app-sdk/handlers/shared";

import { SuccessWebhookResponse } from "@/modules/saleor/saleor-webhook-responses";
import { generateStripeDashboardUrl } from "@/modules/stripe/generate-stripe-dashboard-url";
import { StripeCapturePaymentIntentAPIError } from "@/modules/stripe/stripe-payment-intent-api-error";
import { ChargeErrorResult } from "@/modules/transaction-result/error-result";
import { ChargeSuccessResult } from "@/modules/transaction-result/success-result";

class Ok extends SuccessWebhookResponse {
  readonly transactionResult: ChargeSuccessResult;

  constructor(args: { transactionResult: ChargeSuccessResult }) {
    super();
    this.transactionResult = args.transactionResult;
  }

  getResponse(): Response {
    const typeSafeResponse = buildSyncWebhookResponsePayload<"TRANSACTION_CHARGE_REQUESTED">({
      result: this.transactionResult.result,
      amount: this.transactionResult.saleorMoney.amount,
      pspReference: this.transactionResult.stripePaymentIntentId,
      message: this.transactionResult.message,
      actions: this.transactionResult.actions,
      externalUrl: generateStripeDashboardUrl(
        this.transactionResult.stripePaymentIntentId,
        this.transactionResult.stripeEnv,
      ),
    });

    return Response.json(typeSafeResponse, { status: this.statusCode });
  }
}

class Error extends SuccessWebhookResponse {
  readonly transactionResult: ChargeErrorResult;
  readonly error: StripeCapturePaymentIntentAPIError;

  constructor(args: {
    error: StripeCapturePaymentIntentAPIError;
    transactionResult: ChargeErrorResult;
  }) {
    super();
    this.error = args.error;
    this.transactionResult = args.transactionResult;
  }

  getResponse(): Response {
    const typeSafeResponse = buildSyncWebhookResponsePayload<"TRANSACTION_CHARGE_REQUESTED">({
      result: this.transactionResult.result,
      pspReference: this.transactionResult.stripePaymentIntentId,
      // TODO: remove this after Saleor allows to amount to be optional
      amount: this.transactionResult.saleorEventAmount,
      message: this.error.merchantMessage,
      actions: this.transactionResult.actions,
      externalUrl: generateStripeDashboardUrl(
        this.transactionResult.stripePaymentIntentId,
        this.transactionResult.stripeEnv,
      ),
    });

    return Response.json(typeSafeResponse, { status: this.statusCode });
  }
}

export const TransactionChargeRequestedUseCaseResponses = {
  Ok,
  Error,
};

export type TransactionChargeRequestedUseCaseResponsesType = InstanceType<
  (typeof TransactionChargeRequestedUseCaseResponses)[keyof typeof TransactionChargeRequestedUseCaseResponses]
>;
