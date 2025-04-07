import {
  buildSyncWebhookResponsePayload,
  SyncWebhookResponsesMap,
} from "@saleor/app-sdk/handlers/shared";
import { okAsync, ResultAsync } from "neverthrow";

import {
  PaymentGatewayInitializeResponseShape,
  PaymentGatewayInitializeResponseShapeType,
} from "@/app/api/gateway-initialize/response-shape";
import { BaseError } from "@/lib/errors";

type UseCaseResultShape = SyncWebhookResponsesMap["PAYMENT_GATEWAY_INITIALIZE_SESSION"];

/*
 * todo test
 * todo errors
 */
export class InitializeStripeSessionUseCase {
  static UseCaseError = BaseError.subclass("InitializeStripeSessionUseCaseError");

  constructor() {
    // todo: config repo
  }

  execute(): ResultAsync<UseCaseResultShape, typeof InitializeStripeSessionUseCase.UseCaseError> {
    // todo get config

    const rawShape: PaymentGatewayInitializeResponseShapeType = {
      stripePublishableKey: "todo", // todo fetch from config
    };

    const responseDataShape = PaymentGatewayInitializeResponseShape.parse(rawShape);

    const validResponseShape =
      buildSyncWebhookResponsePayload<"PAYMENT_GATEWAY_INITIALIZE_SESSION">({
        data: responseDataShape,
      });

    return okAsync(validResponseShape);
  }
}
