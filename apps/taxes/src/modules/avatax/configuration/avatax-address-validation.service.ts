import { createLogger, Logger } from "../../../lib/logger";
import { avataxAddressFactory } from "../address-factory";
import { AvataxClient } from "../avatax-client";
import { AvataxConfig } from "../avatax-connection-schema";
import { AvataxValidationErrorResolver } from "./avatax-validation-error-resolver";

export class AvataxAddressValidationService {
  private logger: Logger;

  constructor() {
    this.logger = createLogger({
      name: "AvataxAddressValidationService",
    });
  }

  async validate(config: AvataxConfig) {
    const avataxClient = new AvataxClient(config);
    const address = avataxAddressFactory.fromChannelAddress(config.address);

    try {
      return avataxClient.validateAddress({ address });

      // const responseResolver = new AvataxValidationResponseResolver();
    } catch (error) {
      const errorResolver = new AvataxValidationErrorResolver();

      throw errorResolver.resolve(error);
    }
  }
}
