import { CommonErrorProps, CriticalError, ExpectedError } from "../../error";

// Error thrown when there is not enough data in webhook payload to proceed with. Not reported to Sentry.
export const TaxIncompletePayloadErrors = {
  MissingAddressError: ExpectedError.subclass("MissingAddressError"),
  MissingLinesError: ExpectedError.subclass("MissingLinesError"),
};

// Error thrown when expected data is not present in the payload.
export const TaxBadPayloadError = CriticalError.subclass("TaxBadPayloadError", {
  props: {
    expected: false,
    sentrySeverity: "error",
  } as CommonErrorProps,
});

// Error thrown when expected data is not present in the response.
export const TaxBadProviderResponseError = CriticalError.subclass("TaxBadProviderResponseError", {
  props: {
    expected: false,
    sentrySeverity: "error",
  } as CommonErrorProps,
});

// Error thrown by AvaTax service.
export const AvataxTaxCalculationError = CriticalError.subclass("AvataxTaxCalculationError", {
  props: {
    expected: false,
    sentrySeverity: "error",
  } as CommonErrorProps,
});
export const AvataxInvalidAddressError = ExpectedError.subclass("AvataxInvalidAppAddressError");
export const AvataxGetTaxError = ExpectedError.subclass("AvataxGetTaxError");
export const AvataxInvalidCredentialsError = ExpectedError.subclass(
  "AvataxInvalidCredentialsError",
);
export const AvataxStringLengthError = ExpectedError.subclass("AvataxStringLengthError", {
  props: {
    description: "",
  },
});
export const AvataxEntityNotFoundError = ExpectedError.subclass("AvataxEntityNotFoundError", {
  props: {
    description: "",
  },
});

export const AvataxTransactionAlreadyCancelledError = ExpectedError.subclass(
  "AvataxTransactionAlreadyCancelledError",
  {
    props: {
      description: "",
    },
  },
);
