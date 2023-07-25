import { Logger, createLogger } from "../../lib/logger";
import { AvataxClient } from "./avatax-client";

/*
 * // todo: document
 * Arbitrary key-value pair that is used to store the entity code in the metadata.
 */
const AVATAX_ENTITY_CODE = "avataxEntityCode";

// todo: test
export class AvataxEntityTypeMatcher {
  private client: AvataxClient;
  private logger: Logger;

  constructor({ client }: { client: AvataxClient }) {
    this.client = client;
    this.logger = createLogger({
      name: "AvataxEntityTypeMatcher",
    });
  }

  private readEntityCodeFromMetadata(metadata: Array<{ key: string; value: string }>) {
    const entityCodeMetadata = metadata.find(
      (metadataItem) => metadataItem.key === AVATAX_ENTITY_CODE
    );

    if (!entityCodeMetadata) {
      // Entity code will not always be present in the metadata. We don't want to throw an error.
      return undefined;
    }

    return entityCodeMetadata.value;
  }

  private returnFallback() {
    // Empty string will be treated as non existing entity code.
    return "";
  }

  private async getEntityCode(entityCode: string) {
    const result = await this.client.getEntityUseCode(entityCode);

    return result.value?.[0].code || this.returnFallback();
  }

  async match(metadata: Array<{ key: string; value: string }> | undefined = []) {
    const entityCode = this.readEntityCodeFromMetadata(metadata);

    if (!entityCode) {
      return this.returnFallback();
    }

    try {
      const value = await this.getEntityCode(entityCode);

      return value;
    } catch (error) {
      this.logger.debug({ error }, "Failed to verify entity code");
      return this.returnFallback();
    }
  }
}
