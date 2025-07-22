import { BaseError } from "@saleor/errors";
import { z } from "zod";

import { SourceObjectFragment, TransactionRefundRequestedEventFragment } from "@/generated/graphql";

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
  const productLines = getProductLines(event.sourceObject.lines, appConfig.skuAsName);
  const voucherLine = getVoucherLine(event.sourceObject);
  const shippingLine = getShippingLine(event.sourceObject);

  return AtobaraiGoodsSchema.parse([...productLines, voucherLine, shippingLine].filter(Boolean));
};

/**
 * Creates Atobarai goods from a transaction and a granted refund.
 * It calculates the new set of goods by subtracting the refunded lines from the original transaction lines.
 */
export const createAtobaraiGoodsFromRefund = (
  transaction: NonNullable<TransactionRefundRequestedEventFragment["transaction"]>,
  grantedRefund: NonNullable<TransactionRefundRequestedEventFragment["grantedRefund"]>,
  appConfig: AppChannelConfig,
): AtobaraiGoods => {
  if (!transaction.order) {
    throw new BaseError("Transaction order data is missing, cannot create Atobarai goods.");
  }

  const refundedLinesMap = new Map(
    grantedRefund.lines?.map((line) => [line.orderLine.id, line.quantity]),
  );

  const newOrderLines = transaction.order.lines
    .map((line) => {
      const refundedQuantity = refundedLinesMap.get(line.id);

      if (typeof refundedQuantity !== "number") {
        return line;
      }

      return {
        ...line,
        quantity: line.quantity - refundedQuantity,
      };
    })
    .filter((line) => line.quantity > 0);

  const productLines = getProductLinesFromOrder(newOrderLines, appConfig.skuAsName);

  const voucherLine = getVoucherLine(transaction.order);

  const shippingLine = grantedRefund.shippingCostsIncluded
    ? null
    : getShippingLine(transaction.order);

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

const getProductLinesFromOrder = (
  lines: NonNullable<
    NonNullable<TransactionRefundRequestedEventFragment["transaction"]>["order"]
  >["lines"],
  useSkuAsName: boolean,
) => {
  return lines.map((line) => {
    if (!line.variant) {
      throw new BaseError("Order line does not have a variant. Cannot convert to AtobaraiGoods.");
    }

    return {
      goods_name: getProductGoodsName({
        useSkuAsName,
        productName: line.variant.product.name,
        sku: line.variant.sku,
      }),
      goods_price: line.unitPrice.gross.amount,
      quantity: line.quantity,
    };
  });
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

const getVoucherLine = (sourceObject: Partial<Pick<SourceObjectFragment, "discount">>) => {
  const voucherAmount = sourceObject.discount?.amount;

  if (!voucherAmount) {
    return null;
  }

  return {
    goods_name: "Voucher",
    goods_price: voucherAmount,
    quantity: 1,
  };
};

const getShippingLine = (sourceObject: Partial<Pick<SourceObjectFragment, "shippingPrice">>) => {
  const shippingPrice = sourceObject.shippingPrice?.gross.amount;

  if (!shippingPrice) {
    return null;
  }

  return {
    goods_name: "Shipping",
    goods_price: shippingPrice,
    quantity: 1,
  };
};
