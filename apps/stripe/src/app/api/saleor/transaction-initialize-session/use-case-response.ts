import { buildSyncWebhookResponsePayload } from "@saleor/app-sdk/handlers/shared";
import { z } from "zod";

import { SaleorMoney } from "@/modules/saleor/saleor-money";
import { SuccessWebhookResponse } from "@/modules/saleor/saleor-webhook-responses";
import {
  StripeClientSecretSchema,
  StripeClientSecretType,
} from "@/modules/stripe/stripe-client-secret";
import { StripePaymentIntentIdType } from "@/modules/stripe/stripe-payment-intent-id";

// TODO: add support for other results e.g AUTHORIZE

class ChargeRequest extends SuccessWebhookResponse {
  result = "CHARGE_REQUEST" as const;
  stripeClientSecret: StripeClientSecretType;
  saleorMoney: SaleorMoney;
  stripePaymentIntentId: StripePaymentIntentIdType;

  private static ResponseDataSchema = z.object({
    stripeClientSecret: StripeClientSecretSchema,
  });

  constructor(args: {
    stripeClientSecret: StripeClientSecretType;
    saleorMoney: SaleorMoney;
    stripePaymentIntentId: StripePaymentIntentIdType;
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
        stripeClientSecret: this.stripeClientSecret,
      }),
      result: this.result,
      amount: this.saleorMoney.amount,
      pspReference: this.stripePaymentIntentId,
    });

    return Response.json(typeSafeResponse, { status: this.statusCode });
  }
}

class ChargeFailure extends SuccessWebhookResponse {
  result = "CHARGE_FAILURE" as const;
  message: string;

  constructor(args: { message: string }) {
    super();
    this.message = args.message;
  }

  getResponse() {
    // @ts-expect-error - TODO: amount is required - fix in app-sdk (after confirming that it's not needed)
    const typeSafeResponse = buildSyncWebhookResponsePayload<"TRANSACTION_INITIALIZE_SESSION">({
      result: this.result,
      message: this.message,
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
