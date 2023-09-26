import { BaseError } from "../../error";

const TaxError = BaseError.subclass("TaxError");

// An error that we didn't catch
export const TaxUnknownError = TaxError.subclass("TaxUnknownError");

// An error that we throw because we know it will happen
export const TaxKnownError = TaxError.subclass("TaxKnownError");

// An error that we throw but it shouldn't happen
export const TaxUnexpectedError = TaxError.subclass("TaxUnexpectedError");
