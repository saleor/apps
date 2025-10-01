import { z } from "zod";

import {
  createFailureWebhookResponseDataSchema,
  createSuccessWebhookResponseDataSchema,
} from "@/app/api/webhooks/saleor/saleor-webhook-response-schema";
import { SuccessWebhookResponse } from "@/app/api/webhooks/saleor/saleor-webhook-responses";
import {
  TransactionSessionActionRequired,
  TransactionSessionFailure,
} from "@/generated/app-webhooks-types/transaction-initialize-session";
import { AppContext } from "@/lib/app-context";
import { BaseError } from "@/lib/errors";
import { SaleorMoney } from "@/modules/saleor/saleor-money";
import { generateOrderPayPalDashboardUrl } from "@/modules/paypal/generate-paypal-dashboard-urls";
import {
  PayPalApiError,
  PayPalApiErrorPublicCode,
  PayPalCardErrorPublicCode,
} from "@/modules/paypal/paypal-api-error";
import {
  PayPalClientSecret,
  PayPalClientSecretSchema,
} from "@/modules/paypal/paypal-client-secret";
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
  ParseErrorPublicCode,
  TransactionInitializeSessionEventDataError,
  UnsupportedPaymentMethodErrorPublicCode,
} from "./event-data-parser";

class Success extends SuccessWebhookResponse {
  readonly transactionResult: ChargeActionRequiredResult | AuthorizationActionRequiredResult;
  readonly paypalClientSecret: PayPalClientSecret;
  readonly saleorMoney: SaleorMoney;
  readonly paypalOrderId: PayPalOrderId;

  private static ResponseDataSchema = createSuccessWebhookResponseDataSchema(
    z.object({
      paypalClientSecret: PayPalClientSecretSchema,
    }),
  );

  constructor(args: {
    transactionResult: ChargeActionRequiredResult | AuthorizationActionRequiredResult;
    paypalClientSecret: PayPalClientSecret;
    saleorMoney: SaleorMoney;
    paypalOrderId: PayPalOrderId;
    appContext: AppContext;
  }) {
    super(args.appContext);
    this.transactionResult = args.transactionResult;
    this.paypalClientSecret = args.paypalClientSecret;
    this.saleorMoney = args.saleorMoney;
    this.paypalOrderId = args.paypalOrderId;
  }

  getResponse() {
    if (!this.appContext.paypalEnv) {
      throw new BaseError("PayPal environment is not set. Ensure AppContext is set earlier");
    }

    const typeSafeResponse: TransactionSessionActionRequired = {
      data: Success.ResponseDataSchema.parse({
        order: {
          paypalClientSecret: this.paypalClientSecret,
        },
      }),
      actions: this.transactionResult.actions,
      result: this.transactionResult.result,
      amount: this.saleorMoney.amount,
      pspReference: this.paypalOrderId,
      message: this.transactionResult.message,
      externalUrl: generateOrderPayPalDashboardUrl(
        this.paypalOrderId,
        this.appContext.paypalEnv,
      ),
    };

    return Response.json(typeSafeResponse, { status: this.statusCode });
  }
}

class Failure extends SuccessWebhookResponse {
  readonly transactionResult: ChargeFailureResult | AuthorizationFailureResult;
  readonly error: PayPalApiError | TransactionInitializeSessionEventDataError;

  private static ResponseDataSchema = createFailureWebhookResponseDataSchema(
    z.array(
      z.object({
        code: z.union([
          z.literal(ParseErrorPublicCode),
          z.literal(UnsupportedPaymentMethodErrorPublicCode),
          z.literal(PayPalCardErrorPublicCode),
          z.literal(PayPalApiErrorPublicCode),
        ]),
        message: z.string(),
      }),
    ),
  );

  constructor(args: {
    transactionResult: ChargeFailureResult | AuthorizationFailureResult;
    error: PayPalApiError | TransactionInitializeSessionEventDataError;
    appContext: AppContext;
  }) {
    super(args.appContext);
    this.transactionResult = args.transactionResult;
    this.error = args.error;
  }

  getResponse() {
    const typeSafeResponse: TransactionSessionFailure = {
      // We don't have pspReference in this case or actions because there is no payment intent created
      result: this.transactionResult.result,
      message: this.messageFormatter.formatMessage(this.transactionResult.message, this.error),
      actions: this.transactionResult.actions,
      data: Failure.ResponseDataSchema.parse({
        order: {
          errors: [
            {
              code: this.error.publicCode,
              message: this.messageFormatter.formatMessage(this.error.publicMessage, this.error),
            },
          ],
        },
      }),
    };

    return Response.json(typeSafeResponse, { status: this.statusCode });
  }
}

export const TransactionInitializeSessionUseCaseResponses = {
  Success,
  Failure,
};

export type TransactionInitializeSessionUseCaseResponsesType = InstanceType<
  | typeof TransactionInitializeSessionUseCaseResponses.Success
  | typeof TransactionInitializeSessionUseCaseResponses.Failure
>;
