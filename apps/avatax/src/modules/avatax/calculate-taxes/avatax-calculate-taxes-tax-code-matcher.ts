import { createLogger } from "@saleor/apps-logger";
import { TaxBaseLineFragment } from "../../../../generated/graphql";
import { CriticalError } from "../../../error";
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

  private getTaxClassId(line: TaxBaseLineFragment): string | undefined {
    if (line.sourceLine.__typename === "CheckoutLine") {
      return line.sourceLine.checkoutProductVariant.product.taxClass?.id;
    }

    if (line.sourceLine.__typename === "OrderLine") {
      return line.sourceLine.orderProductVariant?.product.taxClass?.id;
    }

    throw new AvataxCalculateTaxesTaxCodeMatcherError("Unsupported line type", {
      props: {
        // @ts-expect-error: not handled typename is not typed in GraphQL
        type: line.sourceLine.__typename,
      },
    });
  }

  match(line: TaxBaseLineFragment, matches: AvataxTaxCodeMatches) {
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
