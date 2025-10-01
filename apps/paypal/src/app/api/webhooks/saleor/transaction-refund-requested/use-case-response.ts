import { SuccessWebhookResponse } from "@/app/api/webhooks/saleor/saleor-webhook-responses";
import {
  TransactionRefundRequestedAsync,
  TransactionRefundRequestedSyncFailure,
} from "@/generated/app-webhooks-types/transaction-refund-requested";
import { AppContext } from "@/lib/app-context";
import { BaseError } from "@/lib/errors";
import { generateOrderPayPalDashboardUrl } from "@/modules/paypal/generate-paypal-dashboard-urls";
import { PayPalApiError } from "@/modules/paypal/paypal-api-error";
import { PayPalOrderId } from "@/modules/paypal/paypal-payment-intent-id";
import { PayPalRefundId } from "@/modules/paypal/paypal-refund-id";
import { RefundFailureResult } from "@/modules/transaction-result/refund-result";

class Success extends SuccessWebhookResponse {
  readonly paypalRefundId: PayPalRefundId;
  readonly message: string = "";

  constructor(args: { paypalRefundId: PayPalRefundId; appContext: AppContext }) {
    super(args.appContext);
    this.paypalRefundId = args.paypalRefundId;
  }

  getResponse(): Response {
    /*
     * We are using async flow here as currently Saleor doesn't allow `REFUND_REQUEST` to be returned in `TRANSACTION_REFUND_REQUESTED` webhook response. App will report actual refund status when handling PayPal webhook.
     * https://docs.saleor.io/developer/extending/webhooks/synchronous-events/transaction#async-flow-2
     */
    const typeSafeResponse: TransactionRefundRequestedAsync = {
      pspReference: this.paypalRefundId,
    };

    return Response.json(typeSafeResponse, { status: this.statusCode });
  }
}

class Failure extends SuccessWebhookResponse {
  readonly transactionResult: RefundFailureResult;
  readonly error: PayPalApiError;
  readonly paypalOrderId: PayPalOrderId;
  readonly message: string;

  constructor(args: {
    transactionResult: RefundFailureResult;
    error: PayPalApiError;
    paypalOrderId: PayPalOrderId;
    appContext: AppContext;
  }) {
    super(args.appContext);
    this.transactionResult = args.transactionResult;
    this.error = args.error;
    this.paypalOrderId = args.paypalOrderId;
    this.message = this.error.merchantMessage;
  }

  getResponse(): Response {
    if (!this.appContext.paypalEnv) {
      throw new BaseError("PayPal environment is not set. Ensure AppContext is set earlier");
    }

    const typeSafeResponse: TransactionRefundRequestedSyncFailure = {
      result: this.transactionResult.result,
      pspReference: this.paypalOrderId,
      message: this.messageFormatter.formatMessage(this.message, this.error),
      actions: this.transactionResult.actions,
      externalUrl: generateOrderPayPalDashboardUrl(
        this.paypalOrderId,
        this.appContext.paypalEnv,
      ),
    };

    return Response.json(typeSafeResponse, { status: this.statusCode });
  }
}

export const TransactionRefundRequestedUseCaseResponses = {
  Success,
  Failure,
};

export type TransactionRefundRequestedUseCaseResponsesType = InstanceType<
  | typeof TransactionRefundRequestedUseCaseResponses.Success
  | typeof TransactionRefundRequestedUseCaseResponses.Failure
>;
