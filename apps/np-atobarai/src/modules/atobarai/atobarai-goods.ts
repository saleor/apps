import { BaseError } from "@saleor/errors";
import { z } from "zod";

import { SourceObjectFragment } from "@/generated/graphql";

import { AppChannelConfig } from "../app-config/app-config";

export const AtobaraiGoodsSchema = z
  .array(
    z.object({
      goods_name: z.string(),
      goods_price: z.number(),
      quantity: z.number(),
    }),
  )
  .brand("AtobaraiGoods");

export type AtobaraiGoods = z.infer<typeof AtobaraiGoodsSchema>;

/**
 * Creates Atobarai goods from Saleor sourceObject lines.
 */
export const createAtobaraiGoods = (
  event: {
    sourceObject: SourceObjectFragment;
  },
  appConfig: AppChannelConfig,
): AtobaraiGoods => {
  const productLines = getProductLines({
    lines: event.sourceObject.lines,
    useSkuAsName: appConfig.skuAsName,
  });
  const voucherLine = getVoucherLine(event.sourceObject.discount?.amount);
  const shippingLine = getShippingLine(event.sourceObject.shippingPrice.gross.amount);

  return AtobaraiGoodsSchema.parse([...productLines, voucherLine, shippingLine].filter(Boolean));
};

const getProductGoodsName = (args: {
  useSkuAsName: boolean;
  productName: string;
  sku: string | null | undefined;
}): string => {
  if (args.useSkuAsName) {
    return args.sku || args.productName;
  }

  return args.productName;
};

// TODO: use AtobaraiLIneCalcualtion as class here instead of functions

export const getProductLines = ({
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
      goods_name: getProductGoodsName({
        useSkuAsName,
        productName: variant.product.name,
        sku: variant.sku,
      }),
      goods_price: line.unitPrice.gross.amount,
      quantity: line.quantity,
    };
  });
};

export const getVoucherLine = (voucherAmount: number | undefined) => {
  if (!voucherAmount || voucherAmount === 0) {
    return null;
  }

  return {
    goods_name: "Voucher",
    goods_price: voucherAmount,
    quantity: 1,
  };
};

export const getShippingLine = (shippingPrice: number) => {
  if (shippingPrice === 0) {
    return null;
  }

  return {
    goods_name: "Shipping",
    goods_price: shippingPrice,
    quantity: 1,
  };
};

export const getDiscountLine = (discountAmount: number) => {
  if (discountAmount === 0) {
    return null;
  }

  return {
    goods_name: "Discount",
    goods_price: -discountAmount,
    quantity: 1,
  };
};
