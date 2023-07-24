import { createLogger, Logger } from "../../../lib/logger";
import { AvataxClient } from "../avatax-client";
import { BaseAvataxConfig } from "../avatax-connection-schema";
import { AvataxValidationErrorResolver } from "./avatax-validation-error-resolver";

export class AvataxAuthValidationService {
  private logger: Logger;

  constructor() {
    this.logger = createLogger({
      name: "AvataxAuthValidationService",
    });
  }

  async validate(input: BaseAvataxConfig) {
    const avataxClient = new AvataxClient(input);

    try {
      const result = await avataxClient.ping();

      if (!result.authenticated) {
        throw new Error("Invalid Avatax credentials.");
      }
    } catch (error) {
      const errorResolver = new AvataxValidationErrorResolver();

      throw errorResolver.resolve(error);
    }
  }
}
