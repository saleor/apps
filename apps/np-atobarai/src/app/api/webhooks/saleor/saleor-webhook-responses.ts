export abstract class SuccessWebhookResponse {
  statusCode = 200;
}

export abstract class ErrorWebhookResponse {
  statusCode = 500;
  error: Error;

  constructor(error: Error) {
    this.error = error;
  }
}

export class BrokenAppResponse extends ErrorWebhookResponse {
  readonly message = "App is not working";

  getResponse() {
    return Response.json(
      {
        message: this.message,
      },
      { status: this.statusCode },
    );
  }
}

export class AppIsNotConfiguredResponse extends ErrorWebhookResponse {
  readonly message = "App is not configured";
  readonly statusCode = 400;

  getResponse() {
    return Response.json(
      {
        message: this.message,
      },
      { status: this.statusCode },
    );
  }
}

export class UnhandledErrorResponse extends ErrorWebhookResponse {
  readonly message = "Unhandled error";

  getResponse() {
    return Response.json(
      {
        message: this.message,
      },
      { status: this.statusCode },
    );
  }
}

export class MalformedRequestResponse extends ErrorWebhookResponse {
  readonly message = "Malformed request";
  /**
   * This happens when e.g. event can't be parsed by app, because it's different channel etc.
   * That's why we return 202 so Saleor ignores retrying, but also do not disable the webhook via circuit breaker mechanism
   */
  readonly statusCode = 202;

  getResponse() {
    return Response.json(
      {
        message: this.message,
      },
      { status: this.statusCode },
    );
  }
}
