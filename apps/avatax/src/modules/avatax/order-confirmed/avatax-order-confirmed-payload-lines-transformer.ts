import { LineItemModel } from "avatax/lib/models/LineItemModel";
import { ISaleorConfirmedOrderEvent } from "../../saleor";
import { AvataxConfig } from "../avatax-connection-schema";
import { SHIPPING_ITEM_CODE } from "../calculate-taxes/avatax-shipping-line";
import { AvataxTaxCodeMatches } from "../tax-code/avatax-tax-code-match-repository";

export type ConfirmedOrderTransformerData = Pick<
  ISaleorConfirmedOrderEvent,
  "getIsDiscounted" | "getLines" | "getIsTaxIncluded" | "getShippingAmount" | "hasShipping"
>;

export class AvataxOrderConfirmedPayloadLinesTransformer {
  static transform({
    confirmedOrderTransformerData,
    matches,
    avataxConfig,
  }: {
    confirmedOrderTransformerData: ConfirmedOrderTransformerData;
    matches: AvataxTaxCodeMatches;
    avataxConfig: AvataxConfig;
  }): LineItemModel[] {
    const { getIsTaxIncluded, getIsDiscounted, getLines, hasShipping, getShippingAmount } =
      confirmedOrderTransformerData;

    const productLines: LineItemModel[] = getLines().map((line) => ({
      amount: line.getAmount({ isTaxIncluded: getIsTaxIncluded() }),
      taxIncluded: getIsTaxIncluded(),
      taxCode: line.getTaxCode(matches),
      quantity: line.getQuantity(),
      discounted: getIsDiscounted(),
      itemCode: line.getItemCode(),
      description: line.getDescription(),
    }));

    if (hasShipping()) {
      const shippingLine: LineItemModel = {
        amount: getShippingAmount(),
        taxIncluded: getIsTaxIncluded(),
        taxCode: avataxConfig.shippingTaxCode,
        quantity: 1,
        discounted: getIsDiscounted(),
        itemCode: SHIPPING_ITEM_CODE,
      };

      return [...productLines, shippingLine];
    }

    return productLines;
  }
}
