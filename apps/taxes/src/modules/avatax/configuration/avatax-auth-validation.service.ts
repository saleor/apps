import { AvataxClient } from "../avatax-client";
import { AvataxValidationErrorResolver } from "./avatax-validation-error-resolver";
import { createLogger } from "../../../logger";

export class AvataxAuthValidationService {
  private logger = createLogger("AvataxAuthValidationService");

  constructor(private avataxClient: AvataxClient) {}

  async validate() {
    try {
      const result = await this.avataxClient.ping();

      if (!result.authenticated) {
        throw new Error("Invalid AvaTax credentials.");
      }
    } catch (error) {
      const errorResolver = new AvataxValidationErrorResolver();

      throw errorResolver.resolve(error);
    }
  }
}
