export type TaxProviderValidationError = "TaxProviderNotFound";

type TaxProviderErrorName = TaxProviderValidationError;
export class TaxProviderError extends Error {
  constructor(message: string, options: { cause: TaxProviderErrorName }) {
    super(message, options);
  }
}
