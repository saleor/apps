import { PaymentGatewayInitializeSession } from "@/generated/app-webhooks-types/payment-gateway-initialize-session";
import { BaseError } from "@/lib/errors";

import { SuccessWebhookResponse } from "../saleor-webhook-responses";

class Success extends SuccessWebhookResponse {
  constructor() {
    super();
  }

  getResponse() {
    const typeSafeResponse: PaymentGatewayInitializeSession = { data: {} };

    return Response.json(typeSafeResponse, { status: this.statusCode });
  }
}

export const MissingBillingAddressError = BaseError.subclass("MissingBillingAddressError", {
  props: {
    _brand: "MissingBillingAddressError" as const,
    publicCode: "MissingBillingAddressError" as const,
    publicMessage: "Billing address is required for this payment method.",
  },
});

export const MissingShippingAddressError = BaseError.subclass("MissingShippingAddressError", {
  props: {
    _brand: "MissingShippingAddressError" as const,
    publicCode: "MissingShippingAddressError" as const,
    publicMessage: "Shipping address is required for this payment method.",
  },
});

export const UnsupportedCountryError = BaseError.subclass("UnsupportedCountryError", {
  props: {
    _brand: "UnsupportedCountryError" as const,
    publicCode: "UnsupportedCountryError" as const,
    publicMessage: "",
  },
});

export const UnsupportedCurrencyError = BaseError.subclass("UnsupportedCurrencyError", {
  props: {
    _brand: "UnsupportedCurrencyError" as const,
    publicCode: "UnsupportedCurrencyError" as const,
    publicMessage: "",
  },
});

type ValidationError = InstanceType<
  | typeof MissingBillingAddressError
  | typeof MissingShippingAddressError
  | typeof UnsupportedCountryError
  | typeof UnsupportedCurrencyError
>;

class Failure extends SuccessWebhookResponse {
  readonly error: ValidationError;

  constructor(error: ValidationError) {
    super();
    this.error = error;
  }

  getResponse() {
    const typeSafeResponse: PaymentGatewayInitializeSession = {
      data: {
        errors: [
          {
            code: this.error.publicCode,
            message: this.error.publicMessage,
          },
        ],
      },
    };

    return Response.json(typeSafeResponse, { status: this.statusCode });
  }
}

export const PaymentGatewayInitializeSessionUseCaseResponses = {
  Success,
  Failure,
};

export type PaymentGatewayInitializeSessionUseCaseResponsesType = InstanceType<
  typeof PaymentGatewayInitializeSessionUseCaseResponses.Success
>;
