import { LineItemModel } from "avatax/lib/models/LineItemModel";

type SKU = string | null | undefined;
type VariantId = string | null | undefined;

export const avataxProductLine = {
  create({
    amount,
    taxCode,
    taxIncluded,
    discounted,
    quantity,
    itemCode,
    description,
  }: {
    amount: number;
    taxCode: string;
    taxIncluded: boolean;
    discounted: boolean;
    quantity: number;
    itemCode?: string;
    description?: string;
  }): LineItemModel {
    return {
      amount,
      taxIncluded,
      taxCode,
      quantity,
      discounted,
      itemCode,
      description,
    };
  },

  getItemCode(sku: SKU, variantId: VariantId) {
    return sku ?? variantId ?? "";
  },
};
