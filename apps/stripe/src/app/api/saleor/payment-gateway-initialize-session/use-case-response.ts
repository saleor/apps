import { buildSyncWebhookResponsePayload } from "@saleor/app-sdk/handlers/shared";
import { z } from "zod";

import { SuccessWebhookResponse } from "@/modules/saleor/saleor-webhook-responses";
import { StripePublishableKey } from "@/modules/stripe/stripe-publishable-key";

class Success extends SuccessWebhookResponse {
  readonly pk: StripePublishableKey;

  private static ResponseDataSchema = z.object({
    stripePublishableKey: z.string(),
  });

  constructor(args: { pk: StripePublishableKey }) {
    super();
    this.pk = args.pk;
  }

  getResponse() {
    const typeSafeResponse = buildSyncWebhookResponsePayload<"PAYMENT_GATEWAY_INITIALIZE_SESSION">({
      data: Success.ResponseDataSchema.parse({
        stripePublishableKey: this.pk,
      }),
    });

    return Response.json(typeSafeResponse, { status: this.statusCode });
  }
}

export const PaymentGatewayInitializeSessionUseCaseResponses = {
  Success,
};

export type PaymentGatewayInitializeSessionUseCaseResponsesType = InstanceType<
  (typeof PaymentGatewayInitializeSessionUseCaseResponses)[keyof typeof PaymentGatewayInitializeSessionUseCaseResponses]
>;
