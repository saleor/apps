import { createLogger } from "../../lib/logger";
import { AvalaraError } from "avatax/lib/AvaTaxClient";
import { TaxExternalError, TaxUnexpectedError } from "../taxes/tax-error";

export class AvataxErrorNormalizer {
  private logger = createLogger({ name: "AvataxErrorNormalizer" });

  normalize(error: unknown) {
    if (error instanceof AvalaraError) {
      this.logger.debug(error.stack, "AvalaraError occurred");

      return new TaxExternalError(error.message);
    }

    return TaxUnexpectedError.normalize(error);
  }
}
