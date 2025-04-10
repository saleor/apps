export class StripeWebhookSuccessResponse {
  getResponse() {
    // todo What should be the message
    return new Response("OK", {
      status: 200,
    });
  }
}

/**
 * Probably Stripe doesn't retry even if webhook failed.
 *
 * TODO: Check how to handle retrying webhooks
 */
export class StripeWebhookErrorResponse {
  getResponse() {
    // todo What should be the message
    return new Response("Error", {
      // TODO What should be the error
      status: 500,
    });
  }
}

/**
 * Response wrappers, created by UseCases, handled by routes to handle http layer
 */
export type PossibleStripeWebhookResponses =
  | StripeWebhookSuccessResponse
  | StripeWebhookErrorResponse;
