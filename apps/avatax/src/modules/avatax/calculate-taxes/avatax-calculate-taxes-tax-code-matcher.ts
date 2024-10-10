import { FragmentOf } from "gql.tada";

import { readFragment } from "@/graphql";

import { TaxBaseLineFragment } from "../../../../graphql/fragments/TaxBase";
import { CriticalError } from "../../../error";
import { createLogger } from "../../../logger";
import { DEFAULT_TAX_CLASS_ID } from "../constants";
import { AvataxTaxCodeMatches } from "../tax-code/avatax-tax-code-match-repository";

const AvataxCalculateTaxesTaxCodeMatcherError = CriticalError.subclass(
  "AvataxCalculateTaxesTaxCodeMatcherError",
);

export class AvataxCalculateTaxesTaxCodeMatcher {
  private logger = createLogger("AvataxCalculateTaxesTaxCodeMatcher");

  private mapTaxClassWithTaxMatch(taxClassId: string | undefined, matches: AvataxTaxCodeMatches) {
    return matches.find((m) => m.data.saleorTaxClassId === taxClassId);
  }

  private getTaxClassId(line: FragmentOf<typeof TaxBaseLineFragment>): string | undefined {
    const lineFragment = readFragment(TaxBaseLineFragment, line);

    if (lineFragment.sourceLine.__typename === "CheckoutLine") {
      return lineFragment.sourceLine.checkoutProductVariant.product.taxClass?.id;
    }

    if (lineFragment.sourceLine.__typename === "OrderLine") {
      return lineFragment.sourceLine.orderProductVariant?.product.taxClass?.id;
    }

    throw new AvataxCalculateTaxesTaxCodeMatcherError("Unsupported line type", {
      props: {
        type: line.sourceLine.__typename,
      },
    });
  }

  match(line: FragmentOf<typeof TaxBaseLineFragment>, matches: AvataxTaxCodeMatches) {
    const taxClassId = this.getTaxClassId(line);
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
