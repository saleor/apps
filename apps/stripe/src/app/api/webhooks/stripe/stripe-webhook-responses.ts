abstract class NonRetryableErrorWebhookResponse {
  statusCode = 400;
}

abstract class RetryableErrorWebhookResponse {
  statusCode = 500;
}

export class StripeWebhookSuccessResponse {
  readonly statusCode = 200;
  readonly message = "Ok";

  getResponse() {
    return new Response(this.message, {
      status: this.statusCode,
    });
  }
}

export class StripeWebhookMalformedRequestResponse extends NonRetryableErrorWebhookResponse {
  readonly message = "Malformed request";

  getResponse() {
    return new Response(this.message, {
      status: this.statusCode,
    });
  }
}

export class StripeWebhookAppIsNotConfiguredResponse extends NonRetryableErrorWebhookResponse {
  readonly message = "App is not configured";

  getResponse() {
    return new Response(this.message, {
      status: this.statusCode,
    });
  }
}

export class StripeWebhookSeverErrorResponse extends RetryableErrorWebhookResponse {
  readonly message = "Server error";

  getResponse() {
    return new Response(this.message, {
      status: this.statusCode,
    });
  }
}

export type PossibleStripeWebhookSuccessResponses = StripeWebhookSuccessResponse;

export type PossibleStripeWebhookErrorResponses =
  | StripeWebhookMalformedRequestResponse
  | StripeWebhookAppIsNotConfiguredResponse
  | StripeWebhookSeverErrorResponse;
