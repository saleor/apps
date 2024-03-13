import { LineItemModel } from "avatax/lib/models/LineItemModel";

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

  getIsTaxIncluded({ gross, net }: { gross: number; net: number }): boolean {
    return gross === net;
  },
};
