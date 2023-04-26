import { TaxBaseLineFragment } from "../../../generated/graphql";

function getTaxBaseLineDiscount(
  line: TaxBaseLineFragment,
  totalDiscount: number,
  allLinesTotal: number
) {
  if (totalDiscount === 0 || allLinesTotal === 0) {
    return 0;
  }
  const lineTotalAmount = Number(line.totalPrice.amount);
  const discountAmount = (lineTotalAmount / allLinesTotal) * totalDiscount;

  if (discountAmount > lineTotalAmount) {
    return lineTotalAmount;
  }
  return discountAmount;
}

/**
 * * currently the CalculateTaxes subscription uses only the taxjar code (see: TaxBaseLine in TaxBase.graphql)
 * todo: add ability to pass providers or get codes for all providers
 * todo: add `getOrderLineTaxCode`
 * todo: later, replace with tax code matcher
 */
function getTaxBaseLineTaxCode(line: TaxBaseLineFragment): string {
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
}

export const taxLineResolver = {
  getTaxBaseLineDiscount,
  getTaxBaseLineTaxCode,
};
