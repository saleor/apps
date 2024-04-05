import { createLogger } from "@saleor/apps-logger";
import { OrderLineFragment } from "../../../../generated/graphql";
import { DEFAULT_TAX_CLASS_ID } from "../constants";
import { AvataxTaxCodeMatches } from "../tax-code/avatax-tax-code-match-repository";

export class AvataxOrderConfirmedTaxCodeMatcher {
  private logger = createLogger("AvataxOrderConfirmedTaxCodeMatcher");

  private mapTaxClassWithTaxMatch(taxClassId: string | undefined, matches: AvataxTaxCodeMatches) {
    return matches.find((m) => m.data.saleorTaxClassId === taxClassId);
  }

  private getTaxClassId(line: OrderLineFragment): string | undefined {
    return line.taxClass?.id;
  }

  match(line: OrderLineFragment, matches: AvataxTaxCodeMatches) {
    const taxClassId = this.getTaxClassId(line);
    const possibleMatch = this.mapTaxClassWithTaxMatch(taxClassId, matches);

    if (possibleMatch) {
      this.logger.info("Matched tax class with tax code", {
        taxClassId,
        taxCode: possibleMatch.data.avataxTaxCode,
      });
      return possibleMatch.data.avataxTaxCode;
    }

    this.logger.info("Tax class not matched with tax code", {
      taxClassId,
    });

    return DEFAULT_TAX_CLASS_ID;
  }
}
