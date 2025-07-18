import { SuccessWebhookResponse } from "../saleor-webhook-responses";

export class FulfillmentTrackingNumberUpdatedUseCaseResponse extends SuccessWebhookResponse {
  getResponse(): Response {
    return Response.json(
      // TODO: Implement the response for fulfillment tracking number updated webhook
      { message: "Fulfillment tracking number updated webhook is not implemented yet" },
      { status: this.statusCode },
    );
  }
}
