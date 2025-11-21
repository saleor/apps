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
  // We don't want Saleor to disable this app so we return 2xx
  statusCode = 202;

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
  // We don't want Saleor to disable this app so we return 2xx
  statusCode = 202;

  getResponse() {
    return new Response(this.message, {
      status: this.statusCode,
    });
  }
}

export class ObjectCreatedOutsideOfSaleorResponse extends NonRetryableErrorWebhookResponse {
  readonly message = "Object created outside of Saleor is not processable";
  // We don't want Saleor to disable this app so we return 2xx
  statusCode = 202;

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
  | StripeWebhookTransactionMissingResponse
  | ObjectCreatedOutsideOfSaleorResponse;
