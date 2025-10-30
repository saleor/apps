import { z } from "zod";

import { SuccessWebhookResponse } from "@/app/api/webhooks/saleor/saleor-webhook-responses";
import { PaymentGatewayInitializeSession } from "@/generated/app-webhooks-types/payment-gateway-initialize-session";
import { AppContext } from "@/lib/app-context";
import { PayPalClientId } from "@/modules/paypal/paypal-client-id";

class Success extends SuccessWebhookResponse {
  readonly pk: PayPalClientId;
  readonly merchantClientId?: string;

  private static ResponseDataSchema = z.object({
    paypalClientId: z.string(),
    merchantClientId: z.string().optional(),
  });

  constructor(args: { pk: PayPalClientId; merchantClientId?: string; appContext: AppContext }) {
    super(args.appContext);
    this.pk = args.pk;
    this.merchantClientId = args.merchantClientId;
  }

  getResponse() {
    const typeSafeResponse: PaymentGatewayInitializeSession = {
      data: Success.ResponseDataSchema.parse({
        paypalClientId: this.pk,
        merchantClientId: this.merchantClientId,
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
