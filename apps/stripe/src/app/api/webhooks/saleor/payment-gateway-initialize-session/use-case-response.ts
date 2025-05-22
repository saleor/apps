import { buildSyncWebhookResponsePayload } from "@saleor/app-sdk/handlers/shared";
import { z } from "zod";

import { SuccessWebhookResponse } from "@/app/api/webhooks/saleor/saleor-webhook-responses";
import { AppContext } from "@/lib/app-context";
import { StripePublishableKey } from "@/modules/stripe/stripe-publishable-key";

class Success extends SuccessWebhookResponse {
  readonly pk: StripePublishableKey;
  message: string = ""; // todo not cool, maybe drop inheritance and compose

  private static ResponseDataSchema = z.object({
    stripePublishableKey: z.string(),
  });

  constructor(args: { pk: StripePublishableKey; appContext: AppContext }) {
    super(args.appContext);
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
  typeof PaymentGatewayInitializeSessionUseCaseResponses.Success
>;
