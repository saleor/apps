import { OrderGrantedRefundFragment, SourceObjectFragment } from "@/generated/graphql";

import { AtobaraiGoods, createAtobaraiGoods } from "./atobarai-goods";
import { AtobaraiLineCalculation } from "./atobarai-line-calculation";

export class PartialRefundWithoutLineItemsGoodsBuilder {
  private readonly lineCalculation = new AtobaraiLineCalculation();

  build({
    sourceObject,
    useSkuAsName,
    refundedAmount,
  }: {
    sourceObject: SourceObjectFragment;
    useSkuAsName: boolean;
    refundedAmount: number;
  }): AtobaraiGoods {
    const productLines = this.lineCalculation.calculateProductLines({
      lines: sourceObject.lines,
      useSkuAsName,
    });
    const voucherLine = this.lineCalculation.calculateVoucherLine(sourceObject.discount?.amount);
    const shippingLine = this.lineCalculation.calculateShippingLine(
      sourceObject.shippingPrice.gross.amount,
    );
    const discountLine = this.lineCalculation.calculateRefundAligment(refundedAmount);

    return createAtobaraiGoods(
      [...productLines, voucherLine, shippingLine, discountLine].filter(Boolean),
    );
  }
}

export class PartialRefundWithLineItemsGoodsBuilder {
  private readonly lineCalculation = new AtobaraiLineCalculation();

  build({
    sourceObject,
    useSkuAsName,
    grantedRefund,
  }: {
    sourceObject: SourceObjectFragment;
    useSkuAsName: boolean;
    grantedRefund: NonNullable<OrderGrantedRefundFragment>;
  }): AtobaraiGoods {
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

    const productLines = this.lineCalculation.calculateProductLines({
      lines: newOrderLines,
      useSkuAsName,
    });
    const voucherLine = this.lineCalculation.calculateVoucherLine(sourceObject.discount?.amount);
    const shippingLine = this.lineCalculation.calculateShippingLine(
      sourceObject.shippingPrice.gross.amount,
    );

    const refundAligmentLine = grantedRefund.shippingCostsIncluded
      ? this.lineCalculation.calculateRefundAligment(sourceObject.shippingPrice.gross.amount)
      : null;

    return createAtobaraiGoods(
      [...productLines, voucherLine, shippingLine, refundAligmentLine].filter(Boolean),
    );
  }
}
