import { createLogger, Logger } from "../../../lib/logger";
import { AvataxClient } from "../avatax-client";
import { AvataxConfig } from "../avatax-connection-schema";
import { AvataxValidationErrorResolver } from "./avatax-validation-error-resolver";

export class AvataxAuthValidationService {
  private logger: Logger;

  constructor() {
    this.logger = createLogger({
      name: "AvataxAuthValidationService",
    });
  }

  async validate(config: AvataxConfig): Promise<void> {
    const avataxClient = new AvataxClient(config);

    try {
      avataxClient.ping();
    } catch (error) {
      const errorResolver = new AvataxValidationErrorResolver();

      throw errorResolver.resolve(error);
    }
  }
}
