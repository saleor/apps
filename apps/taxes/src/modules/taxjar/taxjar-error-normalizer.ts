import { TaxExternalError } from "../taxes/tax-error";

export function normalizeTaxJarError(error: unknown) {
  return TaxExternalError.normalize(error);
}
