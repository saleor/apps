import { LineItemModel } from "avatax/lib/models/LineItemModel";
import { TaxBaseFragment } from "../../../../generated/graphql";
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

const checkIfIsDiscountedLine = (isDiscounted: boolean, line: TaxBaseLine) => {
  if (isDiscounted) {
    const undiscountedTotalPrice = getUndiscountedTotalPrice(line);
    const totalPrice = line.totalPrice.amount;

    return totalPrice !== undiscountedTotalPrice;
  }

  return false;
};

/**
 * If entire checkout discount then lines in webhook subscription are not discounted
 * If one item is discounted then the line has discounted totalPrice
 */
const checkDiscounts = (taxBase: TaxBaseFragment, isDiscounted: boolean) => {
  let hasEntireCheckoutDiscount = false;
  let hasOncePerOrderVoucher = false;
  let discountedLinesCount = 0;

  for (const line of taxBase.lines) {
    const isLineDiscounted = checkIfIsDiscountedLine(isDiscounted, line);

    if (isLineDiscounted) {
      discountedLinesCount++;
    }
  }

  // If none of the lines are discounted, but isDiscounted is true then it's entire checkout discount
  if (discountedLinesCount === 0 && isDiscounted) {
    hasEntireCheckoutDiscount = true;
  }

  if (discountedLinesCount === 1) {
    hasOncePerOrderVoucher = true;
  }

  return { hasEntireCheckoutDiscount, hasOncePerOrderVoucher };
};

const isProductLineDiscounted = (
  line: TaxBaseLine,
  isDiscounted: boolean,
  hasOncePerOrderVoucher: boolean,
  hasEntireCheckoutDiscount: boolean,
) => {
  if (!isDiscounted) return false;

  if (hasOncePerOrderVoucher) {
    return checkIfIsDiscountedLine(isDiscounted, line);
  }

  return hasEntireCheckoutDiscount;
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
    const isDiscounted = taxBase.discounts.length > 0;
    const { hasEntireCheckoutDiscount, hasOncePerOrderVoucher } = checkDiscounts(
      taxBase,
      isDiscounted,
    );

    const productLines: LineItemModel[] = taxBase.lines.map((line) => {
      const matcher = new AvataxCalculateTaxesTaxCodeMatcher();
      const taxCode = matcher.match(line, matches);

      return {
        amount: getUndiscountedTotalPrice(line),
        taxIncluded: taxBase.pricesEnteredWithTax,
        taxCode,
        quantity: line.quantity,
        discounted: isProductLineDiscounted(
          line,
          isDiscounted,
          hasOncePerOrderVoucher,
          hasEntireCheckoutDiscount,
        ),
      };
    });

    if (taxBase.shippingPrice.amount !== 0) {
      const shippingLine = avataxShippingLine.create({
        amount: taxBase.shippingPrice.amount,
        taxCode: config.shippingTaxCode,
        taxIncluded: taxBase.pricesEnteredWithTax,
        discounted: hasEntireCheckoutDiscount,
      });

      return [...productLines, shippingLine];
    }

    return productLines;
  }
}
