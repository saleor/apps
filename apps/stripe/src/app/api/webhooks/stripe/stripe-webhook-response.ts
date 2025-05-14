import { BaseError } from "@/lib/errors";

export class StripeWebhookSuccessResponse {
  readonly responseStatusCode = 200;

  getResponse() {
    return new Response("Ok", {
      status: this.responseStatusCode,
    });
  }
}

export class StripeWebhookNonRetryableErrorResponse {
  readonly responseStatusCode = 400;

  getResponse() {
    return new Response("Malformed request", {
      status: this.responseStatusCode,
    });
  }
}

export class StripeWebhookRetryableErrorResponse {
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
  | StripeWebhookRetryableErrorResponse;
