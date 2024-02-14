import { LineItemModel } from "avatax/lib/models/LineItemModel";
import {
  OrderConfirmedSubscriptionFragment,
  OrderLine,
  OrderLineFragment,
} from "../../../../generated/graphql";
import { numbers } from "../../taxes/numbers";
import { AvataxConfig } from "../avatax-connection-schema";
import { AvataxTaxCodeMatches } from "../tax-code/avatax-tax-code-match-repository";
import { AvataxOrderConfirmedTaxCodeMatcher } from "./avatax-order-confirmed-tax-code-matcher";

import { SHIPPING_ITEM_CODE } from "../calculate-taxes/avatax-calculate-taxes-adapter";

/**
 * @description Makes sure we use the same line number for creating & refunding transaction. AvaTax requires that the line number is <= 50 characters.
 */
export function resolveAvataxTransactionLineNumber(line: OrderLineFragment) {
  // get last 50 characters of line.id
  return line.id.slice(-50);
}

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
        number: resolveAvataxTransactionLineNumber(line), // * using line.id as number so that we can refund the line in AvataxOrderFullyRefundedPayloadLinesTransformer
        taxIncluded: true, // taxes are included because we treat what is passed in payload as the source of truth
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

    if (order.shippingPrice.net.amount !== 0) {
      // * In AvaTax, shipping is a regular line
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
