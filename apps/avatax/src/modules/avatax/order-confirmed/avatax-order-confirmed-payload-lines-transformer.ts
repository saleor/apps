import { LineItemModel } from "avatax/lib/models/LineItemModel";
import {
  DeprecatedOrderConfirmedSubscriptionFragment,
  SaleorOrder,
  SaleorOrderLine,
} from "../../saleor";
import { SaleorShippingLine } from "../../saleor/shipping-line";
import { AvataxConfig } from "../avatax-connection-schema";
import { AvataxTaxCodeMatches } from "../tax-code/avatax-tax-code-match-repository";
import { AvataxOrderConfirmedTaxCodeMatcher } from "./avatax-order-confirmed-tax-code-matcher";

export class AvataxOrderConfirmedPayloadLinesTransformer {
  transform(
    order: DeprecatedOrderConfirmedSubscriptionFragment,
    saleorOrder: SaleorOrder,
    config: AvataxConfig,
    matches: AvataxTaxCodeMatches,
  ): LineItemModel[] {
    const isDiscounted = order.discounts.length > 0;

    const productLines: LineItemModel[] = order.lines.map((line) => {
      const matcher = new AvataxOrderConfirmedTaxCodeMatcher();
      const taxCode = matcher.match(line, matches);
      const orderLine = new SaleorOrderLine();

      return orderLine.toAvataxLineItem({
        taxIncluded: saleorOrder.taxIncluded,
        gross: line.totalPrice.gross.amount,
        net: line.totalPrice.net.amount,
        taxCode,
        quantity: line.quantity,
        discounted: isDiscounted,
        productSku: line.productSku,
        productVariantId: line.productVariantId,
        description: line.productName,
      });
    });

    if (order.shippingPrice.net.amount !== 0) {
      const saleorShippingLine = new SaleorShippingLine();

      const shippingLine = saleorShippingLine.toAvataxLineItem({
        taxIncluded: saleorOrder.taxIncluded,
        net: order.shippingPrice.net.amount,
        gross: order.shippingPrice.gross.amount,
        /**
         * * Different shipping methods can have different tax codes.
         * https://developer.avalara.com/ecommerce-integration-guide/sales-tax-badge/designing/non-standard-items/
         */
        taxCode: config.shippingTaxCode,
        discounted: isDiscounted,
      });

      return [...productLines, shippingLine];
    }

    return productLines;
  }
}
