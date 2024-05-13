import { LineItemModel } from "avatax/lib/models/LineItemModel";
import { SaleorOrderConfirmedEvent } from "../../saleor";
import { AvataxConfig } from "../avatax-connection-schema";
import { SHIPPING_ITEM_CODE } from "../calculate-taxes/avatax-shipping-line";
import { AvataxTaxCodeMatches } from "../tax-code/avatax-tax-code-match-repository";

export class SaleorOrderToAvataxLinesTransformer {
  transform({
    confirmedOrderEvent,
    matches,
    avataxConfig,
  }: {
    confirmedOrderEvent: SaleorOrderConfirmedEvent;
    matches: AvataxTaxCodeMatches;
    avataxConfig: AvataxConfig;
  }): LineItemModel[] {
    // Price reduction discounts - we send totalPrices with or without discounts and let AvaTax calculate the tax
    const productLines: LineItemModel[] = confirmedOrderEvent.getLines().map((line) => ({
      amount: line.getAmount({ isTaxIncluded: confirmedOrderEvent.getIsTaxIncluded() }),
      taxIncluded: confirmedOrderEvent.getIsTaxIncluded(),
      taxCode: line.getTaxCode(matches),
      quantity: line.getQuantity(),
      itemCode: line.getItemCode(),
      description: line.getDescription(),
    }));

    if (confirmedOrderEvent.hasShipping()) {
      const shippingLine: LineItemModel = {
        amount: confirmedOrderEvent.getShippingAmount(),
        taxIncluded: confirmedOrderEvent.getIsTaxIncluded(),
        taxCode: avataxConfig.shippingTaxCode,
        quantity: 1,
        itemCode: SHIPPING_ITEM_CODE,
      };

      return [...productLines, shippingLine];
    }

    return productLines;
  }
}
