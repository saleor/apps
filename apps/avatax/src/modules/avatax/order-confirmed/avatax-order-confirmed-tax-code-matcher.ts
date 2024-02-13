import { OrderLineFragment } from "../../../../generated/graphql";
import { AvataxTaxCodeMatches } from "../tax-code/avatax-tax-code-match-repository";

export class AvataxOrderConfirmedTaxCodeMatcher {
  private mapTaxClassWithTaxMatch(taxClassId: string, matches: AvataxTaxCodeMatches) {
    return matches.find((m) => m.data.saleorTaxClassId === taxClassId);
  }

  private getTaxClassId(line: OrderLineFragment): string | undefined {
    return line.taxClass?.id;
  }

  match(line: OrderLineFragment, matches: AvataxTaxCodeMatches) {
    const taxClassId = this.getTaxClassId(line);

    // We can fall back to empty string if we don't have a tax code match
    return taxClassId
      ? this.mapTaxClassWithTaxMatch(taxClassId, matches)?.data.avataxTaxCode ?? ""
      : "";
  }
}
