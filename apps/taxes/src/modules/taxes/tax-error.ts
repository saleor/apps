import { BaseError } from "../../error";

const TaxError = BaseError.subclass("TaxError");

/*
 * Errors that happen if there is not enough data in webhook payload to proceed with the process. Is not reported.
 * Better name: BadRequestError?
 */
export const TaxBadWebhookPayloadError = TaxError.subclass("TaxBadWebhookPayloadError");

// Breaks the process. Is reported.
export const TaxCriticalError = TaxError.subclass("TaxCriticalError");

// Error that shouldn't happen. Should provide extra insights for debugging.
export const TaxUnexpectedError = TaxCriticalError.subclass("TaxUnexpectedError");

// Error that happens when external service returns an error
export const TaxExternalError = TaxCriticalError.subclass("TaxExternalError");
