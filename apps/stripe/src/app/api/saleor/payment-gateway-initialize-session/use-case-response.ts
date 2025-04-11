import { buildSyncWebhookResponsePayload } from "@saleor/app-sdk/handlers/shared";

import { SuccessWebhookResponse } from "@/modules/saleor/saleor-webhook-responses";

import { ResponseDataType } from "./response-data";

class Success extends SuccessWebhookResponse {
  responseData: ResponseDataType;

  constructor(args: { responseData: ResponseDataType }) {
    super();
    this.responseData = args.responseData;
  }

  getResponse() {
    const typeSafeResponse = buildSyncWebhookResponsePayload<"PAYMENT_GATEWAY_INITIALIZE_SESSION">({
      data: this.responseData,
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
