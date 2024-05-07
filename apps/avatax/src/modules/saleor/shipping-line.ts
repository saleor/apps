import { LineItemModel } from "avatax/lib/models/LineItemModel";
import { SHIPPING_ITEM_CODE } from "../avatax/calculate-taxes/avatax-shipping-line";

export class SaleorShippingLine {
  private getAmount({
    gross,
    net,
    taxIncluded,
  }: {
    gross: number;
    net: number;
    taxIncluded: boolean;
  }) {
    return taxIncluded ? gross : net;
  }

  public toAvataxLineItem({
    taxIncluded,
    net,
    gross,
    taxCode,
  }: {
    net: number;
    gross: number;
    taxCode: string | undefined;
    taxIncluded: boolean;
  }): LineItemModel {
    return {
      amount: this.getAmount({ taxIncluded, gross, net }),
      taxIncluded,
      taxCode,
      quantity: 1,
      itemCode: SHIPPING_ITEM_CODE,
    };
  }
}
