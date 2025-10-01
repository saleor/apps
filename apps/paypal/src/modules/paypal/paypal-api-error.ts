import { BaseError } from "modern-errors";

export const PayPalApiError = BaseError.subclass("PayPalApiError", {
  props: {
    _brand: "PayPalApiError" as const,
    statusCode: undefined as number | undefined,
    paypalErrorName: undefined as string | undefined,
    paypalErrorMessage: undefined as string | undefined,
  },
});

export type PayPalApiErrorType = InstanceType<typeof PayPalApiError>;

export const mapPayPalErrorToApiError = (error: unknown): PayPalApiErrorType => {
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
