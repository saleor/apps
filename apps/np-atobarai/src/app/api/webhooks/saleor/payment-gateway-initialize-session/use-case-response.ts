import { PaymentGatewayInitializeSession } from "@/generated/app-webhooks-types/payment-gateway-initialize-session";

import { SuccessWebhookResponse } from "../saleor-webhook-responses";
import { PaymentGatewayInitializeSessionValidationError } from "./validation-errors";

class Success extends SuccessWebhookResponse {
  constructor() {
    super();
  }

  getResponse() {
    const typeSafeResponse: PaymentGatewayInitializeSession = { data: {} };

    return Response.json(typeSafeResponse, { status: this.statusCode });
  }
}

class Failure extends SuccessWebhookResponse {
  readonly error: PaymentGatewayInitializeSessionValidationError;

  constructor(error: PaymentGatewayInitializeSessionValidationError) {
    super();
    this.error = error;
  }

  getResponse() {
    const typeSafeResponse: PaymentGatewayInitializeSession = {
      data: {
        errors: [
          {
            code: this.error.publicCode,
            message: this.error.publicMessage,
          },
        ],
      },
    };

    return Response.json(typeSafeResponse, { status: this.statusCode });
  }
}

export const PaymentGatewayInitializeSessionUseCaseResponses = {
  Success,
  Failure,
};

export type PaymentGatewayInitializeSessionUseCaseResponsesType = InstanceType<
  | typeof PaymentGatewayInitializeSessionUseCaseResponses.Success
  | typeof PaymentGatewayInitializeSessionUseCaseResponses.Failure
>;
