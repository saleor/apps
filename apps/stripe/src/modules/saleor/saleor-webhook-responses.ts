export class SuccessWebhookResponse {
  statusCode = 200;
}

export class ErrorWebhookResponse {
  statusCode = 500;
}

export class GetConfigErrorResponse extends ErrorWebhookResponse {
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

export class MissingConfigErrorResponse extends ErrorWebhookResponse {
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

export class SaleorApiUrlCreateErrorResponse extends ErrorWebhookResponse {
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

export class ChargeRequestResponse extends SuccessWebhookResponse {
  // TODO: figure out what actions should we allow here
  actions = [];
}

export class ChargeFailureResponse extends SuccessWebhookResponse {
  // TODO: figure out what actions should we allow here
  actions = [];
}
