import { z } from "zod";
import { createLogger, Logger } from "../../../lib/logger";
import { avataxAddressFactory } from "../address-factory";
import { AvataxClient } from "../avatax-client";
import { AvataxConfig } from "../avatax-connection-schema";
import { AvataxValidationResponseResolver } from "./avatax-validation-response-resolver";
import { AvataxValidationErrorResolver } from "./avatax-validation-error-resolver";

export class AvataxValidationService {
  private logger: Logger;

  constructor() {
    this.logger = createLogger({
      name: "AvataxValidationService",
    });
  }

  async validate(config: AvataxConfig): Promise<void> {
    const avataxClient = new AvataxClient(config);
    const address = avataxAddressFactory.fromChannelAddress(config.address);

    try {
      const validation = await avataxClient.validateAddress({ address });

      const responseResolver = new AvataxValidationResponseResolver();

      responseResolver.resolve(validation);
    } catch (error) {
      const errorResolver = new AvataxValidationErrorResolver();

      throw errorResolver.resolve(error);
    }
  }
}
