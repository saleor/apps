export abstract class SuccessWebhookResponse {
  statusCode = 200;
}

export abstract class ErrorWebhookResponse {
  statusCode = 500;
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

  constructor() {
    super();
  }

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

  getResponse() {
    return Response.json(
      {
        message: this.message,
      },
      { status: this.statusCode },
    );
  }
}
