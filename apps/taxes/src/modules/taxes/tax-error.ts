import { BaseError } from "../../error";

const TaxError = BaseError.subclass("TaxError");

// Error thrown when there is not enough data in webhook payload to proceed with the process. Is expected behavior. Not reported.
export const TaxBadWebhookPayloadError = TaxError.subclass("TaxBadWebhookPayloadError");

// Breaks the process. Is reported.
export const TaxCriticalError = TaxError.subclass("TaxCriticalError");

/*
 * Error that shouldn't happen. Should provide extra insights for debugging.
 * Example use case: the API types say that the field "xyz" is string or undefined. We know that it's always string. For peace of mind, we check if it's undefined and throw this error if it is.
 */
export const TaxUnexpectedError = TaxCriticalError.subclass("TaxUnexpectedError");
