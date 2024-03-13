import { LineItemModel } from "avatax/lib/models/LineItemModel";
import { OrderConfirmedSubscriptionFragment } from "../../../../generated/graphql";
import { AvataxConfig } from "../avatax-connection-schema";
import { avataxProductLine } from "../calculate-taxes/avatax-product-line";
import { avataxShippingLine } from "../calculate-taxes/avatax-shipping-line";
import { AvataxTaxCodeMatches } from "../tax-code/avatax-tax-code-match-repository";
import { AvataxOrderConfirmedTaxCodeMatcher } from "./avatax-order-confirmed-tax-code-matcher";

export class AvataxOrderConfirmedPayloadLinesTransformer {
  transform(
    order: OrderConfirmedSubscriptionFragment,
    config: AvataxConfig,
    matches: AvataxTaxCodeMatches,
  ): LineItemModel[] {
    const productLines: LineItemModel[] = order.lines.map((line) => {
      const matcher = new AvataxOrderConfirmedTaxCodeMatcher();
      const taxCode = matcher.match(line, matches);
      const { gross, net } = line.totalPrice;
      const isTaxIncluded = avataxProductLine.getIsTaxIncluded({
        gross: gross.amount,
        net: net.amount,
      });

      return avataxProductLine.create({
        amount: isTaxIncluded ? gross.amount : net.amount,
        taxIncluded: isTaxIncluded,
        taxCode,
        quantity: line.quantity,
        discounted: order.discounts.length > 0,
        itemCode: line.productSku ?? line.productVariantId ?? "",
        description: line.productName,
      });
    });

    if (order.shippingPrice.net.amount !== 0) {
      const {
        shippingPrice: { gross, net },
      } = order;
      const isTaxIncluded = avataxShippingLine.getIsTaxIncluded({
        gross: gross.amount,
        net: net.amount,
      });

      const shippingLine = avataxShippingLine.create({
        amount: isTaxIncluded ? gross.amount : net.amount,
        taxIncluded: isTaxIncluded,
        /**
         * * Different shipping methods can have different tax codes.
         * https://developer.avalara.com/ecommerce-integration-guide/sales-tax-badge/designing/non-standard-items/
         */
        taxCode: config.shippingTaxCode,
        discounted: order.discounts.length > 0,
      });

      return [...productLines, shippingLine];
    }

    return productLines;
  }
}
