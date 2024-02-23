import { AvataxClient } from "./avatax-client";
import { createLogger } from "../../logger";
import { ok } from "neverthrow";

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

  private validateEntityCode(entityCode: string) {
    return this.client
      .getEntityUseCode(entityCode)
      .map((v) => v.value?.[0].code ?? this.returnFallback());
  }

  // TODO: Now that we get the customer code from user metadata, maybe we should get the entity code from the same place?
  async match(entityCode: string | null | undefined) {
    if (!entityCode) {
      return ok(this.returnFallback());
    }

    return this.validateEntityCode(entityCode).orElse(() => ok(this.returnFallback()));
  }
}
