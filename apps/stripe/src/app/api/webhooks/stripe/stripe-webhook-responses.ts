/**
 * TODO: Verify if this is actually non-retryable. Stripe retries every non-2xx response (4xx included),
 * so these responses are probably retried for up to 3 days. See https://docs.stripe.com/webhooks#automatic-retries
 */
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

export class StripeWebhookTransactionMissingResponse extends NonRetryableErrorWebhookResponse {
  readonly message = "Transaction is missing";

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
  | StripeWebhookSeverErrorResponse
  | StripeWebhookTransactionMissingResponse;
