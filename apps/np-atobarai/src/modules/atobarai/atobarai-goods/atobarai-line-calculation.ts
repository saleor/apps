import { BaseError } from "@saleor/errors";

import { SourceObjectFragment } from "@/generated/graphql";

export class AtobaraiLineCalculation {
  private getProductGoodsName = (args: {
    useSkuAsName: boolean;
    productName: string;
    sku: string | null | undefined;
  }): string => {
    if (args.useSkuAsName) {
      return args.sku || args.productName;
    }

    return args.productName;
  };

  calculateProductLines = ({
    lines,
    useSkuAsName,
  }: {
    lines: SourceObjectFragment["lines"];
    useSkuAsName: boolean;
  }) => {
    return lines.map((line) => {
      const variant = line.__typename === "CheckoutLine" ? line.checkoutVariant : line.orderVariant;

      if (!variant) {
        throw new BaseError(
          `Line ${line.__typename} does not have a variant. Cannot convert to AtobaraiGoods.`,
        );
      }

      return {
        goods_name: this.getProductGoodsName({
          useSkuAsName,
          productName: variant.product.name,
          sku: variant.sku,
        }),
        goods_price: line.unitPrice.gross.amount,
        quantity: line.quantity,
      };
    });
  };

  calculateVoucherLine = (voucherAmount: number | undefined) => {
    if (!voucherAmount || voucherAmount === 0) {
      return null;
    }

    return {
      goods_name: "Voucher",
      goods_price: voucherAmount,
      quantity: 1,
    };
  };

  calculateShippingLine = (shippingPrice: number) => {
    if (shippingPrice === 0) {
      return null;
    }

    return {
      goods_name: "Shipping",
      goods_price: shippingPrice,
      quantity: 1,
    };
  };

  calculateDiscountLine = (discountAmount: number) => {
    if (discountAmount === 0) {
      return null;
    }

    return {
      goods_name: "Discount",
      goods_price: -discountAmount,
      quantity: 1,
    };
  };
}
