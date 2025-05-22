import { ResponseMessageFormatter } from "@/app/api/webhooks/saleor/response-message-formatter";
import { AppContext } from "@/lib/app-context";

export abstract class SuccessWebhookResponse {
  statusCode = 200;
  appContext: AppContext;
  messageFormatter: ResponseMessageFormatter;

  protected constructor(appContext: AppContext) {
    this.appContext = appContext;
    this.messageFormatter = new ResponseMessageFormatter(appContext);
  }
}

export abstract class ErrorWebhookResponse {
  statusCode = 500;
  error: Error;
  appContext: AppContext;
  messageFormatter: ResponseMessageFormatter;

  constructor(appContext: AppContext, error: Error) {
    this.error = error;
    this.appContext = appContext;
    this.messageFormatter = new ResponseMessageFormatter(appContext);
  }
}

export class BrokenAppResponse extends ErrorWebhookResponse {
  readonly message = "App is not working";

  getResponse() {
    return Response.json(
      {
        message: this.messageFormatter.formatMessage(this.message),
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
        message: this.messageFormatter.formatMessage(this.message, this.error),
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
        message: this.messageFormatter.formatMessage(this.message, this.error),
      },
      { status: this.statusCode },
    );
  }
}
