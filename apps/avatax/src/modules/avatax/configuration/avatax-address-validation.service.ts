import { avataxAddressFactory } from "../address-factory";
import { AvataxClient } from "../avatax-client";
import { AvataxConfig } from "../avatax-connection-schema";
import { AvataxValidationErrorResolver } from "./avatax-validation-error-resolver";
import { createLogger } from "../../../logger";

export class AvataxAddressValidationService {
  private logger = createLogger("AvataxAddressValidationService");

  constructor(private avataxClient: AvataxClient) {}

  async validate(address: AvataxConfig["address"]) {
    const formattedAddress = avataxAddressFactory.fromChannelAddress(address);

    this.logger.debug("Validating address");

    return this.avataxClient.validateAddress({ address: formattedAddress }).mapErr((err) => {
      this.logger.debug("Error validating address", {
        error: err,
      });

      return err;
    });
  }
}
