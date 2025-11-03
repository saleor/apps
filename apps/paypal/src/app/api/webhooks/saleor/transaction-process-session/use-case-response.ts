import { SuccessWebhookResponse } from "@/app/api/webhooks/saleor/saleor-webhook-responses";
import { AppContext } from "@/lib/app-context";
import { BaseError } from "@/lib/errors";
import { PayPalOrderId } from "@/modules/paypal/paypal-order-id";
import { PayPalApiError } from "@/modules/paypal/paypal-api-error";
import { SaleorMoney } from "@/modules/saleor/saleor-money";
import { ChargeSuccessResult } from "@/modules/transaction-result/success-result";
import {
  AuthorizationFailureResult,
  ChargeFailureResult,
} from "@/modules/transaction-result/failure-result";

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
      throw new BaseError(`PayPal environment is not set. AppContext: ${JSON.stringify(this.appContext)}`);
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
  readonly transactionResult: ChargeFailureResult | AuthorizationFailureResult;
  readonly error: PayPalApiError;
  readonly paypalOrderId: PayPalOrderId;

  constructor(args: {
    transactionResult: ChargeFailureResult | AuthorizationFailureResult;
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
      throw new BaseError(`PayPal environment is not set. AppContext: ${JSON.stringify(this.appContext)}`);
    }

    const typeSafeResponse = {
      result: this.transactionResult.result,
      amount: null,
      pspReference: this.paypalOrderId,
      message: this.messageFormatter.formatMessage(`${this.transactionResult.message}: ${this.error.message}`),
      actions: this.transactionResult.actions,
    };

    return Response.json(typeSafeResponse, { status: this.statusCode });
  }
}

export const TransactionProcessSessionUseCaseResponses = {
  Success,
  Failure,
} as const;

export type TransactionProcessSessionUseCaseResponsesType =
  | InstanceType<typeof TransactionProcessSessionUseCaseResponses.Success>
  | InstanceType<typeof TransactionProcessSessionUseCaseResponses.Failure>;