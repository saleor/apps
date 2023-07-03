import { LineItemModel } from "avatax/lib/models/LineItemModel";
import { OrderCreatedSubscriptionFragment } from "../../../../generated/graphql";
import { numbers } from "../../taxes/numbers";
import { AvataxConfig } from "../avatax-connection-schema";
import { AvataxTaxCodeMatches } from "../tax-code/avatax-tax-code-match-repository";
import { SHIPPING_ITEM_CODE } from "./avatax-order-created-payload-transformer";
import { AvataxOrderCreatedTaxCodeMatcher } from "./avatax-order-created-tax-code-matcher";

export class AvataxOrderCreatedPayloadLinesTransformer {
  transform(
    order: OrderCreatedSubscriptionFragment,
    config: AvataxConfig,
    matches: AvataxTaxCodeMatches
  ): LineItemModel[] {
    const productLines: LineItemModel[] = order.lines.map((line) => {
      const matcher = new AvataxOrderCreatedTaxCodeMatcher();
      const taxCode = matcher.match(line, matches);

      return {
        // taxes are included because we treat what is passed in payload as the source of truth
        taxIncluded: true,
        amount: numbers.roundFloatToTwoDecimals(
          line.totalPrice.net.amount + line.totalPrice.tax.amount
        ),
        taxCode,
        quantity: line.quantity,
        description: line.productName,
        itemCode: line.productSku ?? "",
        discounted: order.discounts.length > 0,
      };
    });

    if (order.shippingPrice.net.amount !== 0) {
      // * In Avatax, shipping is a regular line
      const shippingLine: LineItemModel = {
        amount: order.shippingPrice.gross.amount,
        taxIncluded: true,
        itemCode: SHIPPING_ITEM_CODE,
        /**
         * * Different shipping methods can have different tax codes.
         * https://developer.avalara.com/ecommerce-integration-guide/sales-tax-badge/designing/non-standard-items/\
         */
        taxCode: config.shippingTaxCode,
        quantity: 1,
      };

      return [...productLines, shippingLine];
    }

    return productLines;
  }
}
