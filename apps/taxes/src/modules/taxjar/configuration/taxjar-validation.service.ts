import { Logger, createLogger } from "../../../lib/logger";
import { taxJarAddressFactory } from "../address-factory";
import { TaxJarClient } from "../taxjar-client";
import { TaxJarConfig } from "../taxjar-connection-schema";
import { TaxJarValidationErrorResolver } from "./tax-jar-validation-error-resolver";

export class TaxJarValidationService {
  private logger: Logger;

  constructor() {
    this.logger = createLogger({
      name: "TaxJarValidationService",
    });
  }

  async validate(config: TaxJarConfig): Promise<void> {
    const taxJarClient = new TaxJarClient(config);

    const address = taxJarAddressFactory.fromChannelToParams(config.address);

    try {
      // if the address is invalid, TaxJar will throw an error (rather than 200 and error messages)
      await taxJarClient.validateAddress({ params: address });
    } catch (error) {
      this.logger.debug({ error });
      const errorResolver = new TaxJarValidationErrorResolver();

      throw errorResolver.resolve(error);
    }
  }
}
