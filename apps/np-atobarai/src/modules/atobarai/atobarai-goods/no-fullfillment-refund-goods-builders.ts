import { OrderGrantedRefundFragment, SourceObjectFragment } from "@/generated/graphql";

import { AtobaraiGoods, AtobaraiGoodsSchema } from "./atobarai-goods";
import { AtobaraiLineCalculation } from "./atobarai-line-calculation";

export class NoFullfillmentPartialRefundWithoutLineItemsGoodsBuilder {
  private readonly lineCalculation = new AtobaraiLineCalculation();

  build({
    sourceObject,
    useSkuAsName,
    amountAfterRefund,
  }: {
    sourceObject: SourceObjectFragment;
    useSkuAsName: boolean;
    amountAfterRefund: number;
  }): AtobaraiGoods {
    const productLines = this.lineCalculation.calculateProductLines({
      lines: sourceObject.lines,
      useSkuAsName,
    });
    const voucherLine = this.lineCalculation.calculateVoucherLine(sourceObject.discount?.amount);
    const shippingLine = this.lineCalculation.calculateShippingLine(
      sourceObject.shippingPrice.gross.amount,
    );
    const discountLine = this.lineCalculation.calculateRefundAligment(amountAfterRefund);

    return AtobaraiGoodsSchema.parse(
      [...productLines, voucherLine, shippingLine, discountLine].filter(Boolean),
    );
  }
}

export class NoFullfillmentPartialRefundWithLineItemsGoodsBuilder {
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

    return AtobaraiGoodsSchema.parse(
      [...productLines, voucherLine, shippingLine, refundAligmentLine].filter(Boolean),
    );
  }
}
