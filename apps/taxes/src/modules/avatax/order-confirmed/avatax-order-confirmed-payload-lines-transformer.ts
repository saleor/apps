import { LineItemModel } from "avatax/lib/models/LineItemModel";
import { OrderConfirmedSubscriptionFragment } from "../../../../generated/graphql";
import { CriticalError } from "../../../error";
import { createLogger } from "../../../logger";
import { numbers } from "../../taxes/numbers";
import { AvataxConfig } from "../avatax-connection-schema";
import { avataxShippingLine } from "../calculate-taxes/avatax-shipping-line";
import { AvataxTaxCodeMatches } from "../tax-code/avatax-tax-code-match-repository";
import { AvataxOrderConfirmedTaxCodeMatcher } from "./avatax-order-confirmed-tax-code-matcher";

const AvataxOrderConfirmedMissingShippingError = CriticalError.subclass(
  "AvataxOrderConfirmedMissingShippingError",
);

const logger = createLogger("AvataxOrderConfirmedPayloadLinesTransformer");

export class AvataxOrderConfirmedPayloadLinesTransformer {
  transform(
    order: OrderConfirmedSubscriptionFragment,
    config: AvataxConfig,
    matches: AvataxTaxCodeMatches,
  ): LineItemModel[] {
    const productLines: LineItemModel[] = order.lines.map((line) => {
      const matcher = new AvataxOrderConfirmedTaxCodeMatcher();
      const taxCode = matcher.match(line, matches);

      return {
        // taxes are included because we treat what is passed in payload as the source of truth
        taxIncluded: true,
        amount: numbers.roundFloatToTwoDecimals(
          line.totalPrice.net.amount + line.totalPrice.tax.amount,
        ),
        taxCode,
        quantity: line.quantity,
        description: line.productName,
        itemCode: line.productSku ?? "",
        discounted: order.discounts.length > 0,
      };
    });

    if (order.shippingPrice.gross.amount !== 0) {
      logger.debug({ order });
      throw new AvataxOrderConfirmedMissingShippingError(
        "Confirmed order cannot be processed without shipping line",
      );
    }

    const shippingLine = avataxShippingLine.create({
      amount: order.shippingPrice.gross.amount,
      taxCode: config.shippingTaxCode,
      taxIncluded: true,
    });

    return [...productLines, shippingLine];
  }
}
