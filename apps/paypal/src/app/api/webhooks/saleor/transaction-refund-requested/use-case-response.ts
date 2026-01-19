import { SuccessWebhookResponse } from "@/app/api/webhooks/saleor/saleor-webhook-responses";
import {
  TransactionRefundRequestedAsync,
  TransactionRefundRequestedSyncFailure,
} from "@/generated/app-webhooks-types/transaction-refund-requested";
import { AppContext } from "@/lib/app-context";
import { BaseError } from "@/lib/errors";
import { generateOrderPayPalDashboardUrl } from "@/modules/paypal/generate-paypal-dashboard-urls";
import { PayPalApiError } from "@/modules/paypal/paypal-api-error";
import { PayPalOrderId } from "@/modules/paypal/paypal-order-id";
import { PayPalRefundId } from "@/modules/paypal/paypal-refund-id";

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
  readonly error: PayPalApiError;
  readonly paypalOrderId: PayPalOrderId;

  constructor(args: {
    error: PayPalApiError;
    paypalOrderId: PayPalOrderId;
    appContext: AppContext;
  }) {
    super(args.appContext);
    this.error = args.error;
    this.paypalOrderId = args.paypalOrderId;
  }

  getResponse(): Response {
    if (!this.appContext.paypalEnv) {
      throw new BaseError("PayPal environment is not set. Ensure AppContext is set earlier");
    }

    const typeSafeResponse: TransactionRefundRequestedSyncFailure = {
      result: "REFUND_FAILURE",
      pspReference: this.paypalOrderId,
      message: this.messageFormatter.formatMessage(this.error.message, this.error),
      actions: [],
      externalUrl: generateOrderPayPalDashboardUrl({
        orderId: this.paypalOrderId,
        env: this.appContext.paypalEnv,
      }),
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
