import { TaxExternalError } from "../taxes/tax-error";

export function normalizeAvaTaxError(error: unknown) {
  return TaxExternalError.normalize(error);
}
