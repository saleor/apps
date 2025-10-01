import { SuccessWebhookResponse } from "@/app/api/webhooks/saleor/saleor-webhook-responses";
import { AppContext } from "@/lib/app-context";
import { BaseError } from "@/lib/errors";
import { PayPalApiErrorType } from "@/modules/paypal/paypal-api-error";
import { PayPalOrderId } from "@/modules/paypal/paypal-order-id";
import { SaleorMoney } from "@/modules/saleor/saleor-money";
import { ChargeFailureResult } from "@/modules/transaction-result/failure-result";
import { ChargeSuccessResult } from "@/modules/transaction-result/success-result";

class Success extends SuccessWebhookResponse {
  readonly transactionResult: ChargeSuccessResult;
  readonly saleorMoney: SaleorMoney;
  readonly paypalOrderId: PayPalOrderId;

  constructor(args: {
    transactionResult: ChargeSuccessResult;
    saleorMoney: SaleorMoney;
    paypalOrderId: PayPalOrderId;
    appContext: AppContext;
  }) {
    super(args.appContext);
    this.transactionResult = args.transactionResult;
    this.saleorMoney = args.saleorMoney;
    this.paypalOrderId = args.paypalOrderId;
  }

  getResponse(): Response {
    if (!this.appContext.paypalEnv) {
      throw new BaseError("PayPal environment is not set. Ensure AppContext is set earlier");
    }

    const typeSafeResponse = {
      result: this.transactionResult.result,
      amount: this.saleorMoney.amount,
      pspReference: this.paypalOrderId,
      message: this.messageFormatter.formatMessage(this.transactionResult.message),
      actions: this.transactionResult.actions,
    };

    return Response.json(typeSafeResponse, { status: this.statusCode });
  }
}

class Failure extends SuccessWebhookResponse {
  readonly transactionResult: ChargeFailureResult;
  readonly error: PayPalApiErrorType;
  readonly paypalOrderId: PayPalOrderId;

  constructor(args: {
    error: PayPalApiErrorType;
    transactionResult: ChargeFailureResult;
    paypalOrderId: PayPalOrderId;
    appContext: AppContext;
  }) {
    super(args.appContext);
    this.error = args.error;
    this.transactionResult = args.transactionResult;
    this.paypalOrderId = args.paypalOrderId;
  }

  getResponse(): Response {
    if (!this.appContext.paypalEnv) {
      throw new BaseError("PayPal environment is not set. Ensure AppContext is set earlier");
    }

    const typeSafeResponse = {
      result: this.transactionResult.result,
      pspReference: this.paypalOrderId,
      message: this.messageFormatter.formatMessage(this.transactionResult.message, this.error),
      actions: this.transactionResult.actions,
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
