import { GetConfigError, MissingConfigError } from "@/modules/app-config/app-config-errors";
import { SaleorApiUrl } from "@/modules/saleor/saleor-api-url";

export class SuccessWebhookResponse {
  statusCode = 200;
}

export class ErrorWebhookResponse {
  statusCode = 500;
}

export class GetConfigErrorResponse extends ErrorWebhookResponse {
  error: InstanceType<typeof GetConfigError>;
  message = "App is not configured - error while getting config";

  constructor(args: { error: InstanceType<typeof GetConfigError> }) {
    super();
    this.error = args.error;
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

export class MissingConfigErrorResponse extends ErrorWebhookResponse {
  error: InstanceType<typeof MissingConfigError>;
  message = "App is not configured - configuration is missing for channel";

  constructor(args: { error: InstanceType<typeof MissingConfigError> }) {
    super();
    this.error = args.error;
  }

  getResponse() {
    return Response.json(
      {
        message: this.message,
        channelId: this.error.channelId,
      },
      { status: this.statusCode },
    );
  }
}

export class UnhandledErrorResponse extends ErrorWebhookResponse {
  error: unknown;
  message = "Unhandled error";

  constructor(args: { error: unknown }) {
    super();
    this.error = args.error;
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
  error: InstanceType<typeof SaleorApiUrl.ValidationError>;
  message = "Saleor API URL is invalid";

  constructor(args: { error: InstanceType<typeof SaleorApiUrl.ValidationError> }) {
    super();
    this.error = args.error;
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

export class ChargeSuccessResponse extends SuccessWebhookResponse {
  actions = ["REFUND", "CANCEL"];
}

export class ChargeFailureResponse extends SuccessWebhookResponse {
  actions = ["REFUND", "CANCEL"];
}
