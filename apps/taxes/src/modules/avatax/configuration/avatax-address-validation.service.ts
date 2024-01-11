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

    try {
      return this.avataxClient.validateAddress({ address: formattedAddress });
    } catch (error) {
      const errorResolver = new AvataxValidationErrorResolver();

      throw errorResolver.resolve(error);
    }
  }
}
