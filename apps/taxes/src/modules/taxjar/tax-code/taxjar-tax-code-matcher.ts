import { TaxBaseLineFragment } from "../../../../generated/graphql";
import { TaxJarTaxCodeMatches } from "./taxjar-tax-code-match-repository";

export class TaxJarTaxCodeMatcher {
  private mapTaxClassWithTaxMatch(taxClassId: string, matches: TaxJarTaxCodeMatches) {
    return matches.find((m) => m.data.saleorTaxClassId === taxClassId);
  }

  private getTaxClassId(line: TaxBaseLineFragment): string | undefined {
    if (line.sourceLine.__typename === "CheckoutLine") {
      return line.sourceLine.checkoutProductVariant.product.taxClass?.id;
    }

    if (line.sourceLine.__typename === "OrderLine") {
      return line.sourceLine.orderProductVariant?.product.taxClass?.id;
    }
  }

  match(line: TaxBaseLineFragment, matches: TaxJarTaxCodeMatches) {
    const taxClassId = this.getTaxClassId(line);

    // We can fall back to empty string if we don't have a tax code match
    return taxClassId
      ? this.mapTaxClassWithTaxMatch(taxClassId, matches)?.data.taxJarTaxCode ?? ""
      : "";
  }
}
