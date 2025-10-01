import { z } from "zod";

import { createFailureWebhookResponseDataSchema } from "@/app/api/webhooks/saleor/saleor-webhook-response-schema";
import { SuccessWebhookResponse } from "@/app/api/webhooks/saleor/saleor-webhook-responses";
import {
  TransactionSessionActionRequired,
  TransactionSessionFailure,
  TransactionSessionSuccess,
} from "@/generated/app-webhooks-types/transaction-process-session";
import { AppContext } from "@/lib/app-context";
import { BaseError } from "@/lib/errors";
import { SaleorMoney } from "@/modules/saleor/saleor-money";
import { generateOrderPayPalDashboardUrl } from "@/modules/paypal/generate-paypal-dashboard-urls";
import {
  PayPalApiError,
  PayPalApiErrorPublicCode,
  PayPalCardErrorPublicCode,
} from "@/modules/paypal/paypal-api-error";
import { PayPalOrderId } from "@/modules/paypal/paypal-payment-intent-id";
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
  readonly paypalOrderId: PayPalOrderId;

  constructor(args: {
    transactionResult: TransactionResult;
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

    const typeSafeResponse: TransactionSessionSuccess | TransactionSessionActionRequired = {
      result: this.transactionResult.result,
      amount: this.saleorMoney.amount,
      pspReference: this.paypalOrderId,
      // https://docs.paypal.com/payments/paymentintents/lifecycle
      message: this.transactionResult.message,
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
  readonly transactionResult: ChargeFailureResult | AuthorizationFailureResult;
  readonly error: PayPalApiError;
  readonly paypalOrderId: PayPalOrderId;

  private static ResponseDataSchema = createFailureWebhookResponseDataSchema(
    z.array(
      z.object({
        code: z.union([z.literal(PayPalCardErrorPublicCode), z.literal(PayPalApiErrorPublicCode)]),
        message: z.string(),
      }),
    ),
  );

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

  getResponse() {
    if (!this.appContext.paypalEnv) {
      throw new BaseError("PayPal environment is not set. Ensure AppContext is set earlier");
    }

    const typeSafeResponse: TransactionSessionFailure = {
      result: this.transactionResult.result,
      message: this.error.merchantMessage,
      pspReference: this.paypalOrderId,
      externalUrl: generateOrderPayPalDashboardUrl(
        this.paypalOrderId,
        this.appContext.paypalEnv,
      ),
      data: Failure.ResponseDataSchema.parse({
        order: {
          errors: [
            {
              code: this.error.publicCode,
              message: this.error.publicMessage,
            },
          ],
        },
      }),
      actions: this.transactionResult.actions,
    };

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
