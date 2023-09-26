import { BaseError } from "../../error";

const TaxError = BaseError.subclass("TaxError");

// Errors that shouldn't happen
export const TaxUnexpectedError = TaxError.subclass("TaxUnexpectedError");

// Errors that are expected to happen
export const TaxExpectedError = TaxError.subclass("TaxExpectedError");
