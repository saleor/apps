import { createLogger, Logger } from "../../../lib/logger";
import { avataxAddressFactory } from "../address-factory";
import { AvataxClient } from "../avatax-client";
import { AvataxConfig } from "../avatax-connection-schema";
import { AvataxValidationErrorResolver } from "./avatax-validation-error-resolver";

export class AvataxAddressValidationService {
  private logger: Logger;

  constructor(private avataxClient: AvataxClient) {
    this.logger = createLogger({
      name: "AvataxAddressValidationService",
    });
  }

  async validate(address: AvataxConfig["address"]) {
    const formattedAddress = avataxAddressFactory.fromChannelAddress(address);

    try {
      return this.avataxClient.validateAddress({ address: formattedAddress });
    } catch (error) {
      const errorResolver = new AvataxValidationErrorResolver();

      throw errorResolver.resolve(error);
    }
  }
}
