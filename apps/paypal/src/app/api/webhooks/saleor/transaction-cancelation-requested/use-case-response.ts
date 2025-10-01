import { SuccessWebhookResponse } from "@/app/api/webhooks/saleor/saleor-webhook-responses";
import {
  TransactionCancelationRequestedSyncFailure,
  TransactionCancelationRequestedSyncSuccess,
} from "@/generated/app-webhooks-types/transaction-cancelation-requested";
import { AppContext } from "@/lib/app-context";
import { BaseError } from "@/lib/errors";
import { SaleorMoney } from "@/modules/saleor/saleor-money";
import { generateOrderPayPalDashboardUrl } from "@/modules/paypal/generate-paypal-dashboard-urls";
import { PayPalApiError } from "@/modules/paypal/paypal-api-error";
import { PayPalOrderId } from "@/modules/paypal/paypal-payment-intent-id";
import {
  CancelFailureResult,
  CancelSuccessResult,
} from "@/modules/transaction-result/cancel-result";

class Success extends SuccessWebhookResponse {
  readonly transactionResult: CancelSuccessResult;
  readonly saleorMoney: SaleorMoney;
  readonly timestamp: Date | null;
  readonly paypalOrderId: PayPalOrderId;

  constructor(args: {
    transactionResult: CancelSuccessResult;
    saleorMoney: SaleorMoney;
    timestamp: Date | null;
    paypalOrderId: PayPalOrderId;
    appContext: AppContext;
  }) {
    super(args.appContext);
    this.transactionResult = args.transactionResult;
    this.saleorMoney = args.saleorMoney;
    this.timestamp = args.timestamp;
    this.paypalOrderId = args.paypalOrderId;
  }

  getResponse(): Response {
    if (!this.appContext.paypalEnv) {
      throw new BaseError("PayPal environment is not set. Ensure AppContext is set earlier");
    }

    const typeSafeResponse: TransactionCancelationRequestedSyncSuccess = {
      result: this.transactionResult.result,
      amount: this.saleorMoney.amount,
      pspReference: this.paypalOrderId,
      message: this.messageFormatter.formatMessage(this.transactionResult.message),
      actions: this.transactionResult.actions,
      externalUrl: generateOrderPayPalDashboardUrl(
        this.paypalOrderId,
        this.appContext.paypalEnv,
      ),
      time: this.timestamp?.toISOString(),
    };

    return Response.json(typeSafeResponse, { status: this.statusCode });
  }
}

class Failure extends SuccessWebhookResponse {
  readonly transactionResult: CancelFailureResult;
  readonly error: PayPalApiError;
  readonly paypalOrderId: PayPalOrderId;

  constructor(args: {
    transactionResult: CancelFailureResult;
    error: PayPalApiError;
    paypalOrderId: PayPalOrderId;
    appContext: AppContext;
  }) {
    super(args.appContext);
    this.transactionResult = args.transactionResult;
    this.error = args.error;
    this.paypalOrderId = args.paypalOrderId;
  }

  getResponse(): Response {
    if (!this.appContext.paypalEnv) {
      throw new BaseError("PayPal environment is not set. Ensure AppContext is set earlier");
    }

    const typeSafeResponse: TransactionCancelationRequestedSyncFailure = {
      result: this.transactionResult.result,
      pspReference: this.paypalOrderId,
      message: this.messageFormatter.formatMessage(this.error.merchantMessage, this.error),
      actions: this.transactionResult.actions,
      externalUrl: generateOrderPayPalDashboardUrl(
        this.paypalOrderId,
        this.appContext.paypalEnv,
      ),
    };

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
