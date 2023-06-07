import { TaxjarError } from "taxjar/dist/util/types";
import { taxJarAddressFactory } from "../address-factory";
import { TaxJarClient } from "../taxjar-client";
import { TaxJarConfig } from "../taxjar-config";

export class TaxJarValidationService {
  constructor() {}
  private resolveTaxJarValidationError(error: unknown): Error {
    if (!(error instanceof TaxjarError)) {
      return new Error("Unknown error while validating TaxJar configuration.");
    }

    if (error.status === 401) {
      return new Error(
        "The provided API token is invalid. Please visit https://support.taxjar.com/article/160-how-do-i-get-a-sales-tax-api-token for more information."
      );
    }

    if (error.status === 404) {
      return new Error(
        "The provided address is invalid. Please visit https://support.taxjar.com/article/659-address-validation to learn about address formatting."
      );
    }

    return new Error(error.detail);
  }

  async validate(config: TaxJarConfig): Promise<void> {
    const taxJarClient = new TaxJarClient(config);

    const address = taxJarAddressFactory.fromChannelToParams(config.address);

    try {
      await taxJarClient.validateAddress({ params: address });
    } catch (error) {
      throw this.resolveTaxJarValidationError(error);
    }
  }
}
