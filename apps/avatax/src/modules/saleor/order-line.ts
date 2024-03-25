import { LineItemModel } from "avatax/lib/models/LineItemModel";
import { SHIPPING_ITEM_CODE } from "../avatax/calculate-taxes/avatax-shipping-line";

type SKU = string | null | undefined;
type VariantId = string | null | undefined;

export class SaleorOrderLine {
  constructor(public taxIncluded: boolean) {
    this.taxIncluded = taxIncluded;
  }

  private getAmount(gross: number, net: number) {
    return this.taxIncluded ? gross : net;
  }

  private getItemCode(sku: SKU, variantId: VariantId) {
    return sku ?? variantId ?? "";
  }

  public toAvataxLineItem({
    gross,
    net,
    taxCode,
    quantity,
    discounted,
    productSku,
    productVariantId,
    description,
  }: {
    gross: number;
    net: number;
    taxCode: string;
    quantity: number;
    discounted: boolean;
    productSku: SKU;
    productVariantId: VariantId;
    description: string;
  }): LineItemModel {
    return {
      amount: this.getAmount(gross, net),
      taxIncluded: this.taxIncluded,
      taxCode,
      quantity,
      discounted,
      itemCode: this.getItemCode(productSku, productVariantId),
      description,
    };
  }

  public toAvataxShippingLineItem({
    net,
    gross,
    taxCode,
    discounted,
  }: {
    net: number;
    gross: number;
    taxCode: string | undefined;
    discounted: boolean;
  }): LineItemModel {
    return {
      amount: this.getAmount(gross, net),
      taxIncluded: this.taxIncluded,
      taxCode,
      quantity: 1,
      discounted,
      itemCode: SHIPPING_ITEM_CODE,
    };
  }
}
