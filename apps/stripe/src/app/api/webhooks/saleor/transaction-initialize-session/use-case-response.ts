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
import { generatePaymentIntentStripeDashboardUrl } from "@/modules/stripe/generate-stripe-dashboard-urls";
import {
  StripeApiError,
  StripeApiErrorPublicCode,
  StripeCardErrorPublicCode,
} from "@/modules/stripe/stripe-api-error";
import {
  StripeClientSecret,
  StripeClientSecretSchema,
} from "@/modules/stripe/stripe-client-secret";
import { StripePaymentIntentId } from "@/modules/stripe/stripe-payment-intent-id";
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
  readonly stripeClientSecret: StripeClientSecret;
  readonly saleorMoney: SaleorMoney;
  readonly stripePaymentIntentId: StripePaymentIntentId;

  private static ResponseDataSchema = createSuccessWebhookResponseDataSchema(
    z.object({
      stripeClientSecret: StripeClientSecretSchema,
    }),
  );

  constructor(args: {
    transactionResult: ChargeActionRequiredResult | AuthorizationActionRequiredResult;
    stripeClientSecret: StripeClientSecret;
    saleorMoney: SaleorMoney;
    stripePaymentIntentId: StripePaymentIntentId;
    appContext: AppContext;
  }) {
    super(args.appContext);
    this.transactionResult = args.transactionResult;
    this.stripeClientSecret = args.stripeClientSecret;
    this.saleorMoney = args.saleorMoney;
    this.stripePaymentIntentId = args.stripePaymentIntentId;
  }

  getResponse() {
    if (!this.appContext.stripeEnv) {
      throw new BaseError("Stripe environment is not set. Ensure AppContext is set earlier");
    }

    const typeSafeResponse: TransactionSessionActionRequired = {
      data: Success.ResponseDataSchema.parse({
        paymentIntent: {
          stripeClientSecret: this.stripeClientSecret,
        },
      }),
      actions: this.transactionResult.actions,
      result: this.transactionResult.result,
      amount: this.saleorMoney.amount,
      pspReference: this.stripePaymentIntentId,
      message: this.transactionResult.message,
      externalUrl: generatePaymentIntentStripeDashboardUrl(
        this.stripePaymentIntentId,
        this.appContext.stripeEnv,
      ),
    };

    return Response.json(typeSafeResponse, { status: this.statusCode });
  }
}

class Failure extends SuccessWebhookResponse {
  readonly transactionResult: ChargeFailureResult | AuthorizationFailureResult;
  readonly error: StripeApiError | TransactionInitializeSessionEventDataError;

  private static ResponseDataSchema = createFailureWebhookResponseDataSchema(
    z.array(
      z.object({
        code: z.union([
          z.literal(ParseErrorPublicCode),
          z.literal(UnsupportedPaymentMethodErrorPublicCode),
          z.literal(StripeCardErrorPublicCode),
          z.literal(StripeApiErrorPublicCode),
        ]),
        message: z.string(),
      }),
    ),
  );

  constructor(args: {
    transactionResult: ChargeFailureResult | AuthorizationFailureResult;
    error: StripeApiError | TransactionInitializeSessionEventDataError;
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
      message: this.messageFormatter.formatMessage(this.error.publicMessage, this.error),
      actions: this.transactionResult.actions,
      data: Failure.ResponseDataSchema.parse({
        paymentIntent: {
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
