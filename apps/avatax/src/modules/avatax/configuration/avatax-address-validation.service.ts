import { avataxAddressFactory } from "../address-factory";
import { type AvataxClient } from "../avatax-client";
import { type AvataxConfig } from "../avatax-connection-schema";

export class AvataxAddressValidationService {
  constructor(private avataxClient: AvataxClient) {}

  async validate(address: AvataxConfig["address"]) {
    const formattedAddress = avataxAddressFactory.fromChannelAddress(address);

    return this.avataxClient.validateAddress({ address: formattedAddress });
  }
}
