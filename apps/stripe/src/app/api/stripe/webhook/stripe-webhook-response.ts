import { BaseError } from "@/lib/errors";

export class StripeWebhookSuccessResponse {
  readonly responseStatusCode = 200;

  getResponse() {
    return new Response("Ok", {
      status: this.responseStatusCode,
    });
  }
}

export class StripeWebhookErrorResponse {
  readonly error: InstanceType<typeof BaseError>;
  readonly responseStatusCode = 500;

  constructor(error: InstanceType<typeof BaseError>) {
    this.error = error;
  }

  getResponse() {
    return new Response("Server error", {
      status: this.responseStatusCode,
    });
  }
}

/**
 * Response wrappers, created by UseCases, handled by routes to handle http layer
 */
export type PossibleStripeWebhookResponses =
  | StripeWebhookSuccessResponse
  | StripeWebhookErrorResponse;
