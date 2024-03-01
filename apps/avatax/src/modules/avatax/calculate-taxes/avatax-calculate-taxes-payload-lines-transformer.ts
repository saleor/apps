import { LineItemModel } from "avatax/lib/models/LineItemModel";
import { TaxBaseFragment, VoucherTypeEnum } from "../../../../generated/graphql";
import { AvataxConfig } from "../avatax-connection-schema";
import { AvataxTaxCodeMatches } from "../tax-code/avatax-tax-code-match-repository";
import { AvataxCalculateTaxesTaxCodeMatcher } from "./avatax-calculate-taxes-tax-code-matcher";
import { avataxShippingLine } from "./avatax-shipping-line";

type TaxBaseLine = TaxBaseFragment["lines"][0];

const getUndiscountedTotalPrice = (line: TaxBaseLine) => {
  if (line.sourceLine.__typename === "CheckoutLine") {
    return line.sourceLine.undiscountedTotalPrice.amount;
  }

  return line.sourceLine.undiscountedTotalPrice.net.amount;
};

const checkIfIsDiscountedLine = (line: TaxBaseLine) => {
  const undiscountedTotalPrice = getUndiscountedTotalPrice(line);
  const totalPrice = line.totalPrice.amount;

  return totalPrice !== undiscountedTotalPrice;
};

const isProductLineDiscounted = (line: TaxBaseLine, taxBase: TaxBaseFragment) => {
  const isDiscounted = taxBase.discounts.length > 0;

  if (!isDiscounted) return false;

  const voucherType = taxBase.sourceObject.voucher?.type;
  const isOncePerOrder = taxBase.sourceObject.voucher?.applyOncePerOrder;

  switch (voucherType) {
    case VoucherTypeEnum.EntireOrder:
      return isOncePerOrder ? checkIfIsDiscountedLine(line) : true;
    case VoucherTypeEnum.SpecificProduct:
      return checkIfIsDiscountedLine(line);
    default:
      return false;
  }
};

const isShippingLineDiscounted = (taxBase: TaxBaseFragment) => {
  const isDiscounted = taxBase.discounts.length > 0;

  if (!isDiscounted) return false;

  const voucherType = taxBase.sourceObject.voucher?.type;

  return voucherType === VoucherTypeEnum.Shipping;
};

export class AvataxCalculateTaxesPayloadLinesTransformer {
  transform(
    taxBase: TaxBaseFragment,
    config: AvataxConfig,
    matches: AvataxTaxCodeMatches,
  ): LineItemModel[] {
    /*
     * // TODO: we should revisit how discounts are distributed and flagged. I see that we can outsource distributing the discounts to AvaTax, which is something we currently do on our side.
     * https://developer.avalara.com/erp-integration-guide/sales-tax-badge/transactions/discounts-and-overrides/discounting-a-transaction/
     */
    const productLines: LineItemModel[] = taxBase.lines.map((line) => {
      const matcher = new AvataxCalculateTaxesTaxCodeMatcher();
      const taxCode = matcher.match(line, matches);

      return {
        amount: getUndiscountedTotalPrice(line),
        taxIncluded: taxBase.pricesEnteredWithTax,
        taxCode,
        quantity: line.quantity,
        discounted: isProductLineDiscounted(line, taxBase),
      };
    });

    if (taxBase.shippingPrice.amount !== 0) {
      const shippingLine = avataxShippingLine.create({
        amount: taxBase.shippingPrice.amount,
        taxCode: config.shippingTaxCode,
        taxIncluded: taxBase.pricesEnteredWithTax,
        discounted: isShippingLineDiscounted(taxBase),
      });

      return [...productLines, shippingLine];
    }

    return productLines;
  }
}
