export class PayPalApiError extends Error {
  public statusCode?: number;
  public paypalErrorName?: string;
  public paypalErrorMessage?: string;
  public _brand = "PayPalApiError" as const;

  constructor(
    message: string,
    options?: {
      statusCode?: number;
      paypalErrorName?: string;
      paypalErrorMessage?: string;
      cause?: unknown;
    }
  ) {
    super(message);
    this.name = "PayPalApiError";
    this.statusCode = options?.statusCode;
    this.paypalErrorName = options?.paypalErrorName;
    this.paypalErrorMessage = options?.paypalErrorMessage;
  }
}

export type PayPalApiErrorPublicCode = "PAYPAL_API_ERROR" | "PAYPAL_AUTH_ERROR";
export type PayPalCardErrorPublicCode = "CARD_DECLINED" | "INSUFFICIENT_FUNDS";

export const mapPayPalErrorToApiError = (error: unknown): PayPalApiError => {
  if (error instanceof PayPalApiError) {
    return error;
  }

  if (error && typeof error === "object" && "statusCode" in error) {
    const paypalError = error as {
      statusCode?: number;
      name?: string;
      message?: string;
      details?: unknown;
    };

    return new PayPalApiError("PayPal API error", {
      statusCode: paypalError.statusCode,
      paypalErrorName: paypalError.name,
      paypalErrorMessage: paypalError.message,
      cause: error,
    });
  }

  return new PayPalApiError("Unknown PayPal error", {
    cause: error,
  });
};
