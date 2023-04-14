import { TaxBaseLineFragment } from "../../../generated/graphql";

const getLineDiscount = (
  line: TaxBaseLineFragment,
  totalDiscount: number,
  allLinesTotal: number
) => {
  if (totalDiscount === 0 || allLinesTotal === 0) {
    return 0;
  }
  const lineTotalAmount = Number(line.totalPrice.amount);
  const discountAmount = (lineTotalAmount / allLinesTotal) * totalDiscount;

  if (discountAmount > lineTotalAmount) {
    return lineTotalAmount;
  }
  return discountAmount;
};

const getLineTaxCode = (line: TaxBaseLineFragment): string => {
  if (line.sourceLine.__typename === "OrderLine") {
    return (
      line.sourceLine.variant?.product.metafield ??
      line.sourceLine.variant?.product.productType.metafield ??
      ""
    );
  }

  return (
    (line.sourceLine.productVariant.product.metafield ||
      line.sourceLine.productVariant.product.productType.metafield) ??
    ""
  );
};

export const taxLineResolver = {
  getLineDiscount,
  getLineTaxCode,
};
