import { SourceObjectFragment, TransactionRefundRequestedEventFragment } from "@/generated/graphql";
import {
  AtobaraiGoodsSchema,
  getDiscountLine,
  getProductLines,
  getShippingLine,
  getVoucherLine,
} from "@/modules/atobarai/atobarai-goods";

export class AtobaraiGoodsBuilder {
  buildForNoFulfillmentPartialRefundWithoutLineItems({
    sourceObject,
    useSkuAsName,
    amountAdjusted,
  }: {
    sourceObject: SourceObjectFragment;
    useSkuAsName: boolean;
    amountAdjusted: number;
  }) {
    const productLines = getProductLines({
      lines: sourceObject.lines,
      useSkuAsName,
    });
    const voucherLine = getVoucherLine(sourceObject.discount?.amount);
    const shippingLine = getShippingLine(sourceObject.shippingPrice.gross.amount);
    const discountLine = getDiscountLine(amountAdjusted);

    return AtobaraiGoodsSchema.parse(
      [...productLines, voucherLine, shippingLine, discountLine].filter(Boolean),
    );
  }

  buildForNoFullfilmentPartialRefundWithLineItems({
    sourceObject,
    useSkuAsName,
    grantedRefund,
  }: {
    sourceObject: SourceObjectFragment;
    useSkuAsName: boolean;
    grantedRefund: NonNullable<TransactionRefundRequestedEventFragment["grantedRefund"]>;
  }) {
    const refundedLinesMap = new Map(
      grantedRefund.lines?.map((line) => [line.orderLine.id, line.quantity]),
    );

    const newOrderLines = sourceObject.lines
      .map((line) => {
        const refundedQuantity = refundedLinesMap.get(line.id);

        if (!refundedQuantity) {
          return line;
        }

        return {
          ...line,
          quantity: line.quantity - refundedQuantity,
        };
      })
      .filter((line) => line.quantity > 0) as SourceObjectFragment["lines"];

    const productLines = getProductLines({
      lines: newOrderLines,
      useSkuAsName,
    });
    const voucherLine = getVoucherLine(sourceObject.discount?.amount);
    const shippingLine = getShippingLine(sourceObject.shippingPrice.gross.amount);

    const discountLine = grantedRefund.shippingCostsIncluded
      ? getDiscountLine(sourceObject.shippingPrice.gross.amount)
      : null;

    return AtobaraiGoodsSchema.parse(
      [...productLines, voucherLine, shippingLine, discountLine].filter(Boolean),
    );
  }
}
