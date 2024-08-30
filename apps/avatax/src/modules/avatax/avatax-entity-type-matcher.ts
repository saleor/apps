import { createLogger } from "../../logger";
import { AvataxClient } from "./avatax-client";

export class AvataxEntityTypeMatcher {
  private logger = createLogger("AvataxEntityTypeMatcher");

  constructor(private avataxClient: Pick<AvataxClient, "getEntityUseCode">) {}

  private returnFallback() {
    // Empty string will be treated as non existing entity code.
    return "";
  }

  private async validateEntityCode(entityCode: string) {
    const result = await this.avataxClient.getEntityUseCode(entityCode);

    // If verified, return the entity code. If not, return empty string.
    return result.value?.[0].code || this.returnFallback();
  }

  // TODO: Now that we get the customer code from user metadata, maybe we should get the entity code from the same place?
  async match(entityCode: string | null | undefined) {
    if (!entityCode) {
      return this.returnFallback();
    }

    try {
      return this.validateEntityCode(entityCode);
    } catch (error) {
      this.logger.debug("Failed to verify entity code", { error });
      return this.returnFallback();
    }
  }
}
