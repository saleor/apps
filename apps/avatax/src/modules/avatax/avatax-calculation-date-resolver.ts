import { z } from "zod";

import { createLogger } from "../../logger";

export class AvataxCalculationDateResolver {
  private logger = createLogger("AvataxCalculationDateResolver");

  resolve(avataxTaxCalculationDate: string | null | undefined, orderCreatedDate: string): Date {
    if (!avataxTaxCalculationDate) {
      this.logger.info("No tax calculation date provided. Falling back to order created date.");
      return new Date(orderCreatedDate);
    }

    // UTC datetime string, e.g. "2021-08-31T13:00:00.000Z"
    const taxCalculationParse = z.string().datetime().safeParse(avataxTaxCalculationDate);

    if (taxCalculationParse.success) {
      // The user is able to pass other tax calculation date than the order creation date.
      this.logger.info(
        "Valid UTC tax calculation date found in metadata. Using it for tax calculation.",
      );
      return new Date(taxCalculationParse.data);
    } else {
      this.logger.warn(
        `The tax calculation date ${avataxTaxCalculationDate} is not a valid UTC datetime. Falling back to order created date.`,
      );

      return new Date(orderCreatedDate);
    }
  }
}
