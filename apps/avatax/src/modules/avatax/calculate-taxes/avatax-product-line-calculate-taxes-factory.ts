import { LineItemModel } from "avatax/lib/models/LineItemModel";
import { TaxBaseLineFragment } from "generated/graphql";

import { BaseError } from "@/error";

export class AvataxProductLineCalculateTaxesFactory {
  private static NotSupportedSourceLineError = BaseError.subclass("NotSupportedSourceLineError");

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
    throw new AvataxProductLineCalculateTaxesFactory.NotSupportedSourceLineError(
      // @ts-expect-error - we don't have types for not supported source line types
      `Source line type ${line.__typename} is not supported`,
    );
  }
}
