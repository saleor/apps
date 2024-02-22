import { AvataxClient } from "../avatax-client";
import { AvataxValidationErrorResolver } from "./avatax-validation-error-resolver";
import { createLogger } from "../../../logger";
import { err, ok } from "neverthrow";

export class AvataxAuthValidationService {
  private logger = createLogger("AvataxAuthValidationService");

  constructor(private avataxClient: AvataxClient) {}

  validate() {
    return this.avataxClient.ping().andThen((result) => {
      if (!result.authenticated) {
        return err(new Error("Invalid AvaTax credentials"));
      }

      return ok(result);
    });
  }
}
