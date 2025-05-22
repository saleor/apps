import { AppContext } from "@/lib/app-context";

export abstract class SuccessWebhookResponse {
  statusCode = 200;
}

export abstract class ErrorWebhookResponse {
  statusCode = 500;
  appContext: AppContext;
  error?: Error;
  abstract message: string;

  /**
   * Allow to show verbose error message in test environment
   * todo: add docs
   */
  protected verboseErrorEnabled = () => this.appContext.stripeEnv === "TEST";

  protected formatErrorMessage = () => {
    if (this.verboseErrorEnabled() && this.error?.message) {
      return `${this.message}: ${this.error?.message}`;
    }

    return this.message;
  };

  constructor(appContext: AppContext, error?: Error) {
    this.appContext = appContext;
    this.error = error;
  }
}

export class BrokenAppResponse extends ErrorWebhookResponse {
  readonly message = "App is not working";

  getResponse() {
    return Response.json(
      {
        message: this.formatErrorMessage(),
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
        message: this.formatErrorMessage(),
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
        message: this.formatErrorMessage(),
      },
      { status: this.statusCode },
    );
  }
}
