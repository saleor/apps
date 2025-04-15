import { buildSyncWebhookResponsePayload } from "@saleor/app-sdk/handlers/shared";
import { z } from "zod";

import { TransactionInitalizeEventDataError } from "@/app/api/saleor/transaction-initialize-session/event-data-parser";
import { BaseError } from "@/lib/errors";
import { SaleorMoney } from "@/modules/saleor/saleor-money";
import { SuccessWebhookResponse } from "@/modules/saleor/saleor-webhook-responses";
import {
  StripeClientSecret,
  StripeClientSecretSchema,
} from "@/modules/stripe/stripe-client-secret";
import { StripePaymentIntentId } from "@/modules/stripe/stripe-payment-intent-id";
import { StripePaymentIntentsApi } from "@/modules/stripe/stripe-payment-intents-api";

// TODO: add support for other results e.g AUTHORIZE

class ChargeRequest extends SuccessWebhookResponse {
  readonly result = "CHARGE_REQUEST" as const;
  readonly stripeClientSecret: StripeClientSecret;
  readonly saleorMoney: SaleorMoney;
  readonly stripePaymentIntentId: StripePaymentIntentId;

  private static ResponseDataSchema = z.object({
    paymentIntent: z.object({
      stripeClientSecret: StripeClientSecretSchema,
    }),
  });

  constructor(args: {
    stripeClientSecret: StripeClientSecret;
    saleorMoney: SaleorMoney;
    stripePaymentIntentId: StripePaymentIntentId;
  }) {
    super();
    this.stripeClientSecret = args.stripeClientSecret;
    this.saleorMoney = args.saleorMoney;
    this.stripePaymentIntentId = args.stripePaymentIntentId;
  }

  getResponse() {
    // TODO: fix typing of buildSyncWebhookResponsePayload - it doesn't allow actions etc.
    const typeSafeResponse = buildSyncWebhookResponsePayload<"TRANSACTION_INITIALIZE_SESSION">({
      data: ChargeRequest.ResponseDataSchema.parse({
        paymentIntent: {
          stripeClientSecret: this.stripeClientSecret,
        },
      }),
      result: this.result,
      amount: this.saleorMoney.amount,
      pspReference: this.stripePaymentIntentId,
    });

    return Response.json(typeSafeResponse, { status: this.statusCode });
  }
}

// TODO: move to factory
// const schema = z.object({
//   paymentIntent: z.object({
//     errors: z.array(),
//   })
// })

class ChargeFailure extends SuccessWebhookResponse {
  readonly result = "CHARGE_FAILURE" as const;
  readonly message: string;
  readonly error:
    | TransactionInitalizeEventDataError
    | InstanceType<typeof StripePaymentIntentsApi.CreatePaymentIntentError>;



  private static ResponseDataSchema = z.object({
    paymentIntent: z.object({
      error: z.object({
        // code 
        reason: z.union([
          z.literal("UnsupportedPaymentMethodError"),
          z.literal("BadRequestError"),
          z.literal("StripeCreatePaymentIntentError"),
        ]),
        // message
        description: z.string(),
      }),
    }),
  });

  private createErrorResponseDetail(): {
    reason: z.infer<typeof ChargeFailure.ResponseDataSchema>["paymentIntent"]["error"]["reason"];
    description: string;
  } {
    switch (this.error._internalName) {
      case "TransactionInitalizeEventDataUnsupportedPaymentMethodError":
        // TODO: move to error props
        return {
          reason: "UnsupportedPaymentMethodError",
          description: "Provided payment method is not supported",
        };
      case "TransactionInitalizeEventDataParseError":
        return {
          reason: "BadRequestError",
          description:
            "Provided data is invalid. Check your data argument to transactionInitalizeSession mutation and try again.",
        };
      case "CreatePaymentIntentError":
        return {
          reason: "StripeCreatePaymentIntentError",
          description: "Stripe API returned error while creating payment intent",
        };
      default:
        // eslint-disable-next-line no-case-declarations
        const exhaustiveCheck: never = this.error;

        throw new BaseError(`Unhandled case: ${exhaustiveCheck}`);
    }
  }

  constructor(args: {
    message: string;
    error:
      | TransactionInitalizeEventDataError
      | InstanceType<typeof StripePaymentIntentsApi.CreatePaymentIntentError>;
  }) {
    super();
    this.message = args.message;
    this.error = args.error;
  }

  getResponse() {
    // @ts-expect-error - TODO: amount is required - fix in app-sdk (after confirming that it's not needed)
    const typeSafeResponse = buildSyncWebhookResponsePayload<"TRANSACTION_INITIALIZE_SESSION">({
      result: this.result,
      message: this.message,
      data: ChargeFailure.ResponseDataSchema.parse({
        paymentIntent: {
          error: this.createErrorResponseDetail(),
        },
      }),
    });

    return Response.json(typeSafeResponse, { status: this.statusCode });
  }
}

export const TransactionInitalizeSessionUseCaseResponses = {
  ChargeRequest,
  ChargeFailure,
};

export type TransactionInitalizeSessionUseCaseResponsesType = InstanceType<
  (typeof TransactionInitalizeSessionUseCaseResponses)[keyof typeof TransactionInitalizeSessionUseCaseResponses]
>;
