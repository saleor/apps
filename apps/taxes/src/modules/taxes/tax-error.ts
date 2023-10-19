import { CriticalError, CommonErrorProps, ExpectedError } from "../../error";

export const TaxError = CriticalError.subclass("TaxError", { props: {} as CommonErrorProps });

// Error thrown when there is not enough data in webhook payload to proceed with the process. Not reported.
export const TaxIncompleteWebhookPayloadError = ExpectedError.subclass(
  "TaxIncompleteWebhookPayloadError",
  {
    props: {
      sentrySeverity: "warning",
    } as CommonErrorProps,
  },
);

// Breaks the process. Is reported.
export const TaxCriticalError = TaxError.subclass("TaxCriticalError", {
  props: {
    expected: false,
    sentrySeverity: "error",
  } as CommonErrorProps,
});

// Error thrown when expected data is not present in the payload.
export const TaxBadPayloadError = TaxCriticalError.subclass("TaxBadPayloadError", {
  props: {
    expected: false,
    sentrySeverity: "error",
  } as CommonErrorProps,
});

// Error thrown when expected data is not present in the response.
export const TaxBadProviderResponseError = TaxCriticalError.subclass(
  "TaxBadProviderResponseError",
  {
    props: {
      expected: false,
      sentrySeverity: "error",
    } as CommonErrorProps,
  },
);

// Error thrown by external service.
export const TaxExternalError = TaxCriticalError.subclass("TaxExternalError", {
  props: {
    expected: false,
    sentrySeverity: "error",
  } as CommonErrorProps,
});
