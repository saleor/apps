import { createLogger, Logger } from "../../lib/logger";
import { TaxJarClient } from "./taxjar-client";
import { TaxJarConfig } from "./taxjar-config";
import { taxJarAddressFactory } from "./address-factory";
import { TaxjarError } from "taxjar/dist/util/types";

export class TaxJarValidationService {
  private logger: Logger;
  constructor() {
    this.logger = createLogger({ service: "TaxJarValidationService" });
  }

  private resolveError(error: unknown): Error {
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
        "The provided address could not be validated. Please visit https://support.taxjar.com/article/659-address-validation for more information."
      );
    }

    return new Error(error.detail);
  }

  async validate(
    config: TaxJarConfig
  ): Promise<{ authenticated: true } | { authenticated: false; error: Error }> {
    const taxJarClient = new TaxJarClient(config);

    try {
      const address = taxJarAddressFactory.fromChannelToParams(config.address);

      await taxJarClient.validateAddress({ params: address });

      return { authenticated: true };
    } catch (error) {
      this.logger.error({ error }, "Error while validating TaxJar configuration");

      return {
        authenticated: false,
        error: this.resolveError(error),
      };
    }
  }
}
