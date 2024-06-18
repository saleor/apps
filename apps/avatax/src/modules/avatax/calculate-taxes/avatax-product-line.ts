import { LineItemModel } from "avatax/lib/models/LineItemModel";

type SKU = string | null | undefined;
type VariantId = string | null | undefined;

export const avataxProductLine = {
  create({
    amount,
    taxCode,
    taxIncluded,
    quantity,
    itemCode,
    description,
    discounted,
  }: {
    amount: number;
    taxCode: string;
    taxIncluded: boolean;
    quantity: number;
    itemCode?: string;
    description?: string;
    discounted?: boolean;
  }): LineItemModel {
    return {
      amount,
      taxIncluded,
      taxCode,
      quantity,
      itemCode,
      description,
      discounted,
    };
  },

  getItemCode(sku: SKU, variantId: VariantId) {
    return sku ?? variantId ?? "";
  },
};
