import { TaxjarError } from "taxjar/dist/util/types";

export class TaxJarValidationErrorResolver {
  resolve(error: unknown): Error {
    if (!(error instanceof TaxjarError)) {
      return new Error("Unknown error while validating TaxJar configuration.");
    }

    if (error.status === 401) {
      return new Error(
        "The provided API token is invalid. Please visit https://support.taxjar.com/article/160-how-do-i-get-a-sales-tax-api-token for more information.",
      );
    }

    if (error.status === 404) {
      return new Error(
        "The provided address is invalid. Please visit https://support.taxjar.com/article/659-address-validation to learn about address formatting.",
      );
    }

    return new Error(error.detail);
  }
}
