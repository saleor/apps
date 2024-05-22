import { AvataxTaxCalculationError } from "../taxes/tax-error";

export function normalizeAvaTaxError(error: unknown) {
  return AvataxTaxCalculationError.normalize(error);
}
