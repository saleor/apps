import { InvalidEventValidationError } from "@/app/api/webhooks/saleor/use-case-errors";
import { AtobaraiApiClientFulfillmentReportError } from "@/modules/atobarai/api/types";

import { SuccessWebhookResponse } from "../saleor-webhook-responses";

class Success extends SuccessWebhookResponse {
  getResponse(): Response {
    return Response.json(
      { message: "Successfully reported fulfillment" },
      { status: this.statusCode },
    );
  }
}

type UseCaseErrors =
  | AtobaraiApiClientFulfillmentReportError
  | InstanceType<typeof InvalidEventValidationError>;

class Failure extends SuccessWebhookResponse {
  public error: UseCaseErrors;

  constructor(error: UseCaseErrors) {
    super();
    this.error = error;
  }
  getResponse(): Response {
    return Response.json(
      { message: this.error.publicMessage ?? "Failed to report fulfillment" },
      { status: this.statusCode },
    );
  }
}

export const FulfillmentTrackingNumberUpdatedUseCaseResponse = {
  Success,
  Failure,
};

export type FulfillmentTrackingNumberUpdatedUseCaseResponse = InstanceType<
  typeof FulfillmentTrackingNumberUpdatedUseCaseResponse.Success
>;
