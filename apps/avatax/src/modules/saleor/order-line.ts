import { LineItemModel } from "avatax/lib/models/LineItemModel";

type SKU = string | null | undefined;
type VariantId = string | null | undefined;

export class SaleorOrderLine {
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

  private getItemCode(sku: SKU, variantId: VariantId) {
    return sku ?? variantId ?? "";
  }

  public toAvataxLineItem({
    taxIncluded,
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
    taxIncluded: boolean;
  }): LineItemModel {
    return {
      amount: this.getAmount({ taxIncluded, gross, net }),
      taxIncluded,
      taxCode,
      quantity,
      discounted,
      itemCode: this.getItemCode(productSku, productVariantId),
      description,
    };
  }
}
