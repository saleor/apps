import { createLogger } from "../../../logger";
import { DEFAULT_TAX_CLASS_ID } from "../constants";
import { AvataxTaxCodeMatches } from "../tax-code/avatax-tax-code-match-repository";

export class AvataxOrderConfirmedTaxCodeMatcher {
  private logger = createLogger("AvataxOrderConfirmedTaxCodeMatcher");

  private mapTaxClassWithTaxMatch(taxClassId: string | undefined, matches: AvataxTaxCodeMatches) {
    return matches.find((m) => m.data.saleorTaxClassId === taxClassId);
  }

  match({ taxClassId, matches }: { taxClassId?: string; matches: AvataxTaxCodeMatches }) {
    const possibleMatch = this.mapTaxClassWithTaxMatch(taxClassId, matches);

    if (possibleMatch) {
      this.logger.info("Matched tax class with tax code", {
        taxClassId,
        taxCode: possibleMatch.data.avataxTaxCode,
      });
      return possibleMatch.data.avataxTaxCode;
    }

    this.logger.info("Tax class not matched with tax code, returning default tax class id", {
      taxClassId: DEFAULT_TAX_CLASS_ID,
    });

    return DEFAULT_TAX_CLASS_ID;
  }
}
