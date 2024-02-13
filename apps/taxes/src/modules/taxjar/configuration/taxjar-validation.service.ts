import { taxJarAddressFactory } from "../address-factory";
import { TaxJarClient } from "../taxjar-client";
import { TaxJarConfig } from "../taxjar-connection-schema";
import { TaxJarValidationErrorResolver } from "./tax-jar-validation-error-resolver";
import { createLogger } from "../../../logger";

export class TaxJarValidationService {
  private logger = createLogger("TaxJarValidationService");

  async validate(config: TaxJarConfig): Promise<void> {
    const taxJarClient = new TaxJarClient(config);

    const address = taxJarAddressFactory.fromChannelToParams(config.address);

    try {
      // if the address is invalid, TaxJar will throw an error (rather than 200 and error messages)
      await taxJarClient.validateAddress({ params: address });
    } catch (error) {
      this.logger.debug("Taxjar address validation failed", { error });
      const errorResolver = new TaxJarValidationErrorResolver();

      throw errorResolver.resolve(error);
    }
  }
}
