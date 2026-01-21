import { SourceObjectFragment } from "@/generated/graphql";

import { AtobaraiGoods, createAtobaraiGoods } from "./atobarai-goods";
import { AtobaraiLineCalculation } from "./atobarai-line-calculation";

export class TransactionGoodBuilder {
  private readonly lineCalculation = new AtobaraiLineCalculation();

  build({
    sourceObject,
    useSkuAsName,
  }: {
    sourceObject: SourceObjectFragment;
    useSkuAsName: boolean;
  }): AtobaraiGoods {
    const productLines = this.lineCalculation.calculateProductLines({
      lines: sourceObject.lines,
      useSkuAsName: useSkuAsName,
    });
    const voucherLine = this.lineCalculation.calculateVoucherLine(sourceObject.discount?.amount);
    const shippingLine = this.lineCalculation.calculateShippingLine(
      sourceObject.shippingPrice.gross.amount,
    );

    return createAtobaraiGoods([...productLines, voucherLine, shippingLine].filter(Boolean));
  }
}
