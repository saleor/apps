import { OrderLineFragment } from "../../../../generated/graphql";
import { TaxJarTaxCodeMatches } from "../tax-code/taxjar-tax-code-match-repository";

export class TaxJarOrderConfirmedTaxCodeMatcher {
  private mapTaxClassWithTaxMatch(taxClassId: string, matches: TaxJarTaxCodeMatches) {
    return matches.find((m) => m.data.saleorTaxClassId === taxClassId);
  }

  private getTaxClassId(line: OrderLineFragment): string | undefined {
    return line.taxClass?.id;
  }

  match(line: OrderLineFragment, matches: TaxJarTaxCodeMatches) {
    const taxClassId = this.getTaxClassId(line);

    // We can fall back to empty string if we don't have a tax code match
    return taxClassId
      ? this.mapTaxClassWithTaxMatch(taxClassId, matches)?.data.taxJarTaxCode ?? ""
      : "";
  }
}
