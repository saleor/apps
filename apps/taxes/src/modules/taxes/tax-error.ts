import { BaseError, BaseErrorProps } from "../../error";

export const TaxError = BaseError.subclass("TaxError", { props: {} as BaseErrorProps });

// Error thrown when there is not enough data in webhook payload to proceed with the process. Not reported.
export const TaxIncompleteWebhookPayloadError = TaxError.subclass(
  "TaxIncompleteWebhookPayloadError",
  {
    props: {
      expected: true,
    } as BaseErrorProps,
  },
);

// Breaks the process. Is reported.
export const TaxCriticalError = TaxError.subclass("TaxCriticalError", {
  props: {
    expected: false,
  } as BaseErrorProps,
});

// Error thrown when expected data is not present in the payload.
export const TaxBadPayloadError = TaxCriticalError.subclass("TaxBadPayloadError", {
  props: {
    expected: false,
  } as BaseErrorProps,
});

// Error thrown when expected data is not present in the response.
export const TaxBadProviderResponseError = TaxCriticalError.subclass(
  "TaxBadProviderResponseError",
  {
    props: {
      expected: false,
    } as BaseErrorProps,
  },
);
