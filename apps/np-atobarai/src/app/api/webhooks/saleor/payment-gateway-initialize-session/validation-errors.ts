import { BaseError } from "@/lib/errors";

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

export type PaymentGatewayInitializeSessionValidationError = InstanceType<
  typeof UnsupportedCountryError | typeof UnsupportedCurrencyError
>;
