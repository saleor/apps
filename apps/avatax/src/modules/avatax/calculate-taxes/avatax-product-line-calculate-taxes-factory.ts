import { LineItemModel } from "avatax/lib/models/LineItemModel";
import { TaxBaseLineFragment } from "generated/graphql";

export class AvataxProductLineCalculateTaxesFactory {
  createFromSaleorLine(args: {
    saleorLine: TaxBaseLineFragment;
    taxIncluded: boolean;
    taxCode: string;
    discounted: boolean;
  }): LineItemModel {
    return {
      amount: args.saleorLine.totalPrice.amount,
      taxIncluded: args.taxIncluded,
      taxCode: args.taxCode,
      quantity: args.saleorLine.quantity,
      itemCode: this.getItemCodeFromSourceLine(args.saleorLine.sourceLine),
      discounted: args.discounted,
    };
  }

  private getItemCodeFromSourceLine(line: TaxBaseLineFragment["sourceLine"]) {
    if (line.__typename === "CheckoutLine") {
      return line.checkoutProductVariant.sku ?? line.checkoutProductVariant.id ?? "";
    }
    if (line.__typename === "OrderLine") {
      return line.orderProductVariant?.sku ?? line.orderProductVariant?.id ?? "";
    }
  }
}
