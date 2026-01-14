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
