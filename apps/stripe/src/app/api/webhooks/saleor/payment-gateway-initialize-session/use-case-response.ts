import { z } from "zod";

import { SuccessWebhookResponse } from "@/app/api/webhooks/saleor/saleor-webhook-responses";
import { PaymentGatewayInitializeSession } from "@/generated/json-schema/payment-gateway-initialize-session";
import { AppContext } from "@/lib/app-context";
import { StripePublishableKey } from "@/modules/stripe/stripe-publishable-key";

class Success extends SuccessWebhookResponse {
  readonly pk: StripePublishableKey;

  private static ResponseDataSchema = z.object({
    stripePublishableKey: z.string(),
  });

  constructor(args: { pk: StripePublishableKey; appContext: AppContext }) {
    super(args.appContext);
    this.pk = args.pk;
  }

  getResponse() {
    const typeSafeResponse: PaymentGatewayInitializeSession = {
      data: Success.ResponseDataSchema.parse({
        stripePublishableKey: this.pk,
      }),
    };

    return Response.json(typeSafeResponse, { status: this.statusCode });
  }
}

export const PaymentGatewayInitializeSessionUseCaseResponses = {
  Success,
};

export type PaymentGatewayInitializeSessionUseCaseResponsesType = InstanceType<
  typeof PaymentGatewayInitializeSessionUseCaseResponses.Success
>;
