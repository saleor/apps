export class SuccessWebhookResponse {
  statusCode = 200;
}

export class ErrorWebhookResponse {
  statusCode = 500;
}

export class BrokenAppResponse extends ErrorWebhookResponse {
  message = "App is not working";

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
  message = "App is not configured";
  statusCode = 400;

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
  message = "Unhandled error";

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
  message = "Malformed request";

  getResponse() {
    return Response.json(
      {
        message: this.message,
      },
      { status: this.statusCode },
    );
  }
}
