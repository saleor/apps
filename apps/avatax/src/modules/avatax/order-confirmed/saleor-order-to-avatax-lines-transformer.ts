import { LineItemModel } from "avatax/lib/models/LineItemModel";

import { SaleorOrderConfirmedEvent } from "../../saleor";
import { AvataxConfig } from "../avatax-connection-schema";
import { SHIPPING_ITEM_CODE } from "../calculate-taxes/avatax-shipping-line";
import { PriceReductionDiscountsStrategy } from "../discounts";
import { AvataxTaxCodeMatches } from "../tax-code/avatax-tax-code-match-repository";

export class SaleorOrderToAvataxLinesTransformer {
  transform({
    confirmedOrderEvent,
    matches,
    avataxConfig,
    discountsStrategy,
  }: {
    confirmedOrderEvent: SaleorOrderConfirmedEvent;
    matches: AvataxTaxCodeMatches;
    avataxConfig: AvataxConfig;
    discountsStrategy: PriceReductionDiscountsStrategy;
  }): LineItemModel[] {
    const areLinesDiscounted = discountsStrategy.areLinesDiscounted(confirmedOrderEvent);

    const productLines: LineItemModel[] = confirmedOrderEvent.getLines().map((line) => ({
      amount: line.getAmount({ isTaxIncluded: confirmedOrderEvent.getIsTaxIncluded() }),
      taxIncluded: confirmedOrderEvent.getIsTaxIncluded(),
      taxCode: line.getTaxCode(matches),
      quantity: line.getQuantity(),
      itemCode: line.getItemCode(),
      description: line.getDescription(),
      discounted: areLinesDiscounted,
    }));

    if (confirmedOrderEvent.hasShipping()) {
      const shippingLine: LineItemModel = {
        amount: confirmedOrderEvent.getShippingAmount(),
        taxIncluded: confirmedOrderEvent.getIsTaxIncluded(),
        taxCode: avataxConfig.shippingTaxCode,
        quantity: 1,
        itemCode: SHIPPING_ITEM_CODE,
        discounted: areLinesDiscounted,
      };

      return [...productLines, shippingLine];
    }

    return productLines;
  }
}
