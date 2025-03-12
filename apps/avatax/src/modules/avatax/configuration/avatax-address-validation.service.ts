import { avataxAddressFactory } from "../address-factory";
import { AvataxClient } from "../avatax-client";
import { AvataxConfig } from "../avatax-connection-schema";

export class AvataxAddressValidationService {
  constructor(private avataxClient: AvataxClient) {}

  async validate(address: AvataxConfig["address"]) {
    const formattedAddress = avataxAddressFactory.fromChannelAddress(address);

    return this.avataxClient.validateAddress({ address: formattedAddress });
  }
}
