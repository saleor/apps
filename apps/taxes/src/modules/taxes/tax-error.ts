import { BaseError, BaseErrorProps } from "../../error";

const TaxError = BaseError.subclass("TaxError", { props: {} as BaseErrorProps });

// Error thrown when there is not enough data in webhook payload to proceed with the process.
export const TaxBadWebhookPayloadError = TaxError.subclass("TaxBadWebhookPayloadError", {
  props: {
    expected: true,
  } as BaseErrorProps,
});

// Breaks the process. Is reported.
export const TaxCriticalError = TaxError.subclass("TaxCriticalError", {
  props: {
    expected: false,
  } as BaseErrorProps,
});

// Error thrown when expected data is not present in the payload.
export const TaxIncompletePayloadError = TaxCriticalError.subclass("TaxIncompletePayloadError", {
  props: {
    expected: false,
  } as BaseErrorProps,
});

// Error thrown when expected data is not present in the response.
export const TaxIncompleteResponseError = TaxCriticalError.subclass("TaxIncompleteResponseError", {
  props: {
    expected: false,
  } as BaseErrorProps,
});
