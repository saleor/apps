import { SuccessWebhookResponse } from "@/app/api/webhooks/saleor/saleor-webhook-responses";
import { AppContext } from "@/lib/app-context";
import { BaseError } from "@/lib/errors";
import { PayPalOrderId } from "@/modules/paypal/paypal-order-id";
import { PayPalApiError } from "@/modules/paypal/paypal-api-error";
import { SaleorMoney } from "@/modules/saleor/saleor-money";
import {
  AuthorizationActionRequiredResult,
  ChargeActionRequiredResult,
} from "@/modules/transaction-result/action-required-result";
import {
  AuthorizationFailureResult,
  ChargeFailureResult,
} from "@/modules/transaction-result/failure-result";

class Success extends SuccessWebhookResponse {
  readonly transactionResult: ChargeActionRequiredResult | AuthorizationActionRequiredResult;
  readonly saleorMoney: SaleorMoney;
  readonly paypalOrderId: PayPalOrderId;

  constructor(args: {
    transactionResult: ChargeActionRequiredResult | AuthorizationActionRequiredResult;
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
      data: {
        paypal_order_id: this.paypalOrderId,
        environment: this.appContext.paypalEnv,
      },
    };

    return Response.json(typeSafeResponse, { status: this.statusCode });
  }
}

class ActionRequired extends SuccessWebhookResponse {
  readonly transactionResult: ChargeActionRequiredResult | AuthorizationActionRequiredResult;
  readonly paypalOrderId: PayPalOrderId;
  readonly data: {
    paypal_order_id: string;
    environment: string;
  };

  constructor(args: {
    transactionResult: ChargeActionRequiredResult | AuthorizationActionRequiredResult;
    paypalOrderId: PayPalOrderId;
    data: {
      client_token: string | null;
      paypal_order_id: string;
      environment: string;
    };
    appContext: AppContext;
  }) {
    super(args.appContext);
    this.transactionResult = args.transactionResult;
    this.paypalOrderId = args.paypalOrderId;
    this.data = {
      paypal_order_id: args.data.paypal_order_id,
      environment: args.data.environment,
    };
  }

  getResponse(): Response {
    if (!this.appContext.paypalEnv) {
      throw new BaseError("PayPal environment is not set. Ensure AppContext is set earlier");
    }

    const typeSafeResponse = {
      result: this.transactionResult.result,
      amount: null, // Amount not available in action required response
      pspReference: this.paypalOrderId,
      message: this.messageFormatter.formatMessage(this.transactionResult.message),
      actions: this.transactionResult.actions,
      data: this.data,
    };

    return Response.json(typeSafeResponse, { status: this.statusCode });
  }
}

class Failure extends SuccessWebhookResponse {
  readonly transactionResult: ChargeFailureResult | AuthorizationFailureResult;
  readonly error: PayPalApiError;
  readonly paypalOrderId?: PayPalOrderId;

  constructor(args: {
    transactionResult: ChargeFailureResult | AuthorizationFailureResult;
    error: PayPalApiError;
    paypalOrderId?: PayPalOrderId;
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

    const typeSafeResponse = {
      result: this.transactionResult.result,
      amount: null,
      pspReference: this.paypalOrderId || null,
      message: this.messageFormatter.formatMessage(`${this.transactionResult.message}: ${this.error.message}`),
      actions: this.transactionResult.actions,
    };

    return Response.json(typeSafeResponse, { status: this.statusCode });
  }
}

export const TransactionInitializeSessionUseCaseResponses = {
  Success,
  ActionRequired,
  Failure,
} as const;

export type TransactionInitializeSessionUseCaseResponsesType =
  | InstanceType<typeof TransactionInitializeSessionUseCaseResponses.Success>
  | InstanceType<typeof TransactionInitializeSessionUseCaseResponses.ActionRequired>
  | InstanceType<typeof TransactionInitializeSessionUseCaseResponses.Failure>;