import { TaxBaseLineFragment } from "../../../../generated/graphql";
import { AvataxTaxCodeMatches } from "./avatax-tax-code-match-repository";

export class AvataxTaxCodeMatcher {
  private mapTaxClassWithTaxMatch(taxClassId: string, matches: AvataxTaxCodeMatches) {
    return matches.find((m) => m.data.saleorTaxClass?.id === taxClassId);
  }

  private getTaxClassId(line: TaxBaseLineFragment): string | undefined {
    if (line.sourceLine.__typename === "CheckoutLine") {
      return line.sourceLine.checkoutProductVariant.product.taxClass?.id;
    }

    if (line.sourceLine.__typename === "OrderLine") {
      return line.sourceLine.orderProductVariant?.product.taxClass?.id;
    }
  }

  match(line: TaxBaseLineFragment, matches: AvataxTaxCodeMatches) {
    const taxClassId = this.getTaxClassId(line);

    return taxClassId
      ? this.mapTaxClassWithTaxMatch(taxClassId, matches)?.data.avataxTaxCode.code
      : "";
  }
}
