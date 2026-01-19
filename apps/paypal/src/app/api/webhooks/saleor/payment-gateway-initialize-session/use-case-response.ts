import { z } from "zod";

import { SuccessWebhookResponse } from "@/app/api/webhooks/saleor/saleor-webhook-responses";
import { PaymentGatewayInitializeSession } from "@/generated/app-webhooks-types/payment-gateway-initialize-session";
import { AppContext } from "@/lib/app-context";
import { PayPalClientId } from "@/modules/paypal/paypal-client-id";

class Success extends SuccessWebhookResponse {
  readonly pk: PayPalClientId;
  readonly merchantClientId?: string;
  readonly merchantId?: string;
  readonly paymentMethodReadiness?: {
    applePay: boolean;
    googlePay: boolean;
    paypalButtons: boolean;
    advancedCardProcessing: boolean;
    vaulting: boolean;
  };

  private static ResponseDataSchema = z.object({
    paypalClientId: z.string(),
    merchantClientId: z.string().optional(),
    merchantId: z.string().optional(),
    paymentMethodReadiness: z.object({
      applePay: z.boolean(),
      googlePay: z.boolean(),
      paypalButtons: z.boolean(),
      advancedCardProcessing: z.boolean(),
      vaulting: z.boolean(),
    }).optional(),
  });

  constructor(args: {
    pk: PayPalClientId;
    merchantClientId?: string;
    merchantId?: string;
    paymentMethodReadiness?: {
      applePay: boolean;
      googlePay: boolean;
      paypalButtons: boolean;
      advancedCardProcessing: boolean;
      vaulting: boolean;
    };
    appContext: AppContext;
  }) {
    super(args.appContext);
    this.pk = args.pk;
    this.merchantClientId = args.merchantClientId;
    this.merchantId = args.merchantId;
    this.paymentMethodReadiness = args.paymentMethodReadiness;
  }

  getResponse() {
    const typeSafeResponse: PaymentGatewayInitializeSession = {
      data: Success.ResponseDataSchema.parse({
        paypalClientId: this.pk,
        merchantClientId: this.merchantClientId,
        merchantId: this.merchantId,
        paymentMethodReadiness: this.paymentMethodReadiness,
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
