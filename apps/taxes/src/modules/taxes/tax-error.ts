import { BaseError } from "../../error";

const TaxError = BaseError.subclass("TaxError");

// Expected error that is not reported.
const TaxExpectedError = TaxError.subclass("TaxExpectedError");

// Error thrown when there is not enough data in webhook payload to proceed with the process.
export const TaxBadWebhookPayloadError = TaxExpectedError.subclass("TaxBadWebhookPayloadError");

// Breaks the process. Is reported.
export const TaxCriticalError = TaxError.subclass("TaxCriticalError");

// Error thrown when expected data is not present in the payload.
export const TaxIncompletePayloadError = TaxCriticalError.subclass("TaxIncompletePayloadError");

// Error thrown when expected data is not present in the response.
export const TaxIncompleteResponseError = TaxCriticalError.subclass("TaxIncompleteResponseError");
