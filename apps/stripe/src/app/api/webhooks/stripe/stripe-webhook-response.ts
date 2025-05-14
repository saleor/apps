import { BaseError } from "@/lib/errors";

export class StripeWebhookSuccessResponse {
  readonly responseStatusCode = 200;

  getResponse() {
    // todo What should be the message
    return new Response("OK", {
      status: this.responseStatusCode,
    });
  }
}

/**
 * Probably Stripe doesn't retry even if webhook failed.
 *
 * TODO: Check how to handle retrying webhooks
 */
export class StripeWebhookErrorResponse {
  readonly error: InstanceType<typeof BaseError>;
  readonly responseStatusCode = 500;

  constructor(error: InstanceType<typeof BaseError>) {
    this.error = error;
  }

  getResponse() {
    // todo What should be the message
    return new Response("Error", {
      // TODO What should be the error?
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
