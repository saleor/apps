import { z } from "zod";
import { OrderConfirmedSubscriptionFragment } from "../../../../generated/graphql";
import { createLogger } from "../../../lib/logger";

export class AvataxOrderConfirmedCalculationDateResolver {
  private logger = createLogger({
    name: "AvataxOrderConfirmedCalculationDateResolver",
  });

  resolve(order: OrderConfirmedSubscriptionFragment): Date {
    if (!order.avataxTaxCalculationDate) {
      this.logger.info("No tax calculation date provided. Falling back to order created date.");
      return new Date(order.created);
    }

    // UTC datetime string, e.g. "2021-08-31T13:00:00.000Z"
    const taxCalculationParse = z.string().datetime().safeParse(order.avataxTaxCalculationDate);

    if (taxCalculationParse.success) {
      // The user is able to pass other tax calculation date than the order creation date.
      this.logger.info(
        "Valid UTC tax calculation date found in metadata. Using it for tax calculation."
      );
      return new Date(taxCalculationParse.data);
    } else {
      this.logger.warn(
        `The tax calculation date ${order.avataxTaxCalculationDate} is not a valid UTC datetime. Falling back to order created date.`
      );

      return new Date(order.created);
    }
  }
}
