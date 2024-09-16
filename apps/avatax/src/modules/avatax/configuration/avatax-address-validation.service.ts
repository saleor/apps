import { fromPromise } from "neverthrow";

import { avataxAddressFactory } from "../address-factory";
import { AvataxClient } from "../avatax-client";
import { AvataxConfig } from "../avatax-connection-schema";
import { AvataxErrorsParser } from "../avatax-errors-parser";

const errorParser = new AvataxErrorsParser();

export class AvataxAddressValidationService {
  constructor(private avataxClient: AvataxClient) {}

  async validate(address: AvataxConfig["address"]) {
    const formattedAddress = avataxAddressFactory.fromChannelAddress(address);

    return fromPromise(
      this.avataxClient.validateAddress({ address: formattedAddress }),
      errorParser.parse,
    );
  }
}
