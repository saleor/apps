import { BaseError } from "@saleor/errors";

import { SourceObjectFragment } from "@/generated/graphql";

export const AtobaraiLineCalculationError = BaseError.subclass("AtobaraiLineCalculationError", {
  props: {
    _brand: "AtobaraiLineCalculationError" as const,
  },
});

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
        throw new AtobaraiLineCalculationError(
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
      goods_price: -voucherAmount,
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

  calculateRefundAligment = (refundAmount: number) => {
    if (refundAmount === 0) {
      return null;
    }

    return {
      goods_name: "Discount", // App uses the same name as Saleor plugin to keep backwards compatibility
      goods_price: -refundAmount,
      quantity: 1,
    };
  };
}
