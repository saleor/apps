import { BaseError } from "@saleor/errors";
import { z } from "zod";

import { SourceObjectFragment } from "@/generated/graphql";

import { AppChannelConfig } from "../app-config/app-config";

export const AtobaraiGoodsSchema = z
  .array(
    z.object({
      goods_name: z.string(),
      goods_price: z.number(),
      goods_quantity: z.number(),
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
  const productLines = getProductLines(event.sourceObject.lines, appConfig.skuAsName);
  const voucherLine = getVoucherLine(event.sourceObject);
  const shippingLine = getShippingLine(event.sourceObject);

  return AtobaraiGoodsSchema.parse([...productLines, voucherLine, shippingLine].filter(Boolean));
};

const getProductLines = (lines: SourceObjectFragment["lines"], useSkuAsName: boolean) => {
  return lines.map((line) => {
    const variant = line.__typename === "CheckoutLine" ? line.checkoutVariant : line.orderVariant;

    if (!variant) {
      throw new BaseError(
        `Line ${line.__typename} does not have a variant. Cannot convert to AtobaraiGoods.`,
      );
    }

    return {
      goods_name: useSkuAsName ? variant.sku : variant.product.name,
      goods_price: line.totalPrice.gross.amount,
      goods_quantity: line.quantity,
    };
  });
};

const getVoucherLine = (sourceObject: SourceObjectFragment) => {
  const voucherAmount = sourceObject.discount?.amount;

  if (!voucherAmount) {
    return null;
  }

  return {
    goods_name: "Voucher",
    goods_price: voucherAmount,
    goods_quantity: 1,
  };
};

const getShippingLine = (sourceObject: SourceObjectFragment) => {
  const shippingPrice = sourceObject.shippingPrice?.gross.amount;

  if (!shippingPrice) {
    return null;
  }

  return {
    goods_name: "Shipping",
    goods_price: shippingPrice,
    goods_quantity: 1,
  };
};
