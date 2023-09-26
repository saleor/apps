import { TaxjarError } from "taxjar/dist/util/types";
import { createLogger } from "../../lib/logger";
import { TaxExternalError, TaxUnexpectedError } from "../taxes/tax-error";

export class TaxJarErrorNormalizer {
  private logger = createLogger({ name: "TaxJarErrorNormalizer" });

  normalize(error: unknown) {
    if (error instanceof TaxjarError) {
      this.logger.debug(error.stack, "TaxjarError occurred");

      return new TaxExternalError(error.message);
    }

    return TaxUnexpectedError.normalize(error);
  }
}
