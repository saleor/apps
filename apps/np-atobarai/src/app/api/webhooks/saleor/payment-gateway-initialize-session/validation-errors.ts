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

export const MissingBillingAddressError = BaseError.subclass("MissingBillingAddressError", {
  props: {
    _brand: "MissingBillingAddressError" as const,
    publicCode: "MissingBillingAddressError" as const,
    publicMessage: "Billing address is required",
  },
});

export const MissingBillingPhoneNumberError = BaseError.subclass("MissingBillingPhoneNumberError", {
  props: {
    _brand: "MissingBillingPhoneNumberError" as const,
    publicCode: "MissingBillingPhoneNumberError" as const,
    publicMessage: "Billing phone number is required",
  },
});

export const MissingEmailError = BaseError.subclass("MissingEmailError", {
  props: {
    _brand: "MissingEmailError" as const,
    publicCode: "MissingEmailError" as const,
    publicMessage: "Email is required",
  },
});

export const WrongPhoneNumberFormatError = BaseError.subclass("WrongPhoneNumberFormatError", {
  props: {
    _brand: "WrongPhoneNumberFormatError" as const,
    publicCode: "WrongPhoneNumberFormatError" as const,
    publicMessage: "Phone number format is incorrect - it should start with +81",
  },
});

export type PaymentGatewayInitializeSessionValidationError = InstanceType<
  | typeof UnsupportedCountryError
  | typeof UnsupportedCurrencyError
  | typeof MissingBillingAddressError
  | typeof MissingBillingPhoneNumberError
  | typeof MissingEmailError
  | typeof WrongPhoneNumberFormatError
>;
