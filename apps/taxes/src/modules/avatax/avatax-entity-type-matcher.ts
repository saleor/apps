import { AvataxClient } from "./avatax-client";
import { createLogger } from "../../logger";

/*
 * Arbitrary key-value pair that is used to store the entity code in the metadata.
 * see: https://docs.saleor.io/docs/3.x/developer/app-store/apps/taxes/avatax#mapping-the-entity-type
 */
const AVATAX_ENTITY_CODE = "avataxEntityCode";

export class AvataxEntityTypeMatcher {
  private client: AvataxClient;
  private logger = createLogger("AvataxEntityTypeMatcher");

  constructor({ client }: { client: AvataxClient }) {
    this.client = client;
  }

  private returnFallback() {
    // Empty string will be treated as non existing entity code.
    return "";
  }

  private async validateEntityCode(entityCode: string) {
    const result = await this.client.getEntityUseCode(entityCode);

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
