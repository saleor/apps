import { createId } from "../../../lib/utils";
import { TaxCode } from "../../tax-codes/tax-code-match-schema";
import { TaxJarTaxCodeMatches } from "./taxjar-tax-code-match-repository";

export class TaxJarTaxCodeMapper {
  /**
   * Maps the tax codes from TaxJar to the tax code matches.
   * @param {string} taxJarTaxCodes - The tax codes from TaxJar.
   * @param {string} savedMatches - The tax code matches that were already saved in the system.
   * @returns {TaxJarTaxCodeMatches} The TaxJar tax codes mapped to the tax code matches (with/without match).
   */
  map(taxJarTaxCodes: TaxCode[], savedMatches: TaxJarTaxCodeMatches): TaxJarTaxCodeMatches {
    const mappedTaxCodes = taxJarTaxCodes.map((taxCode) => {
      const match = savedMatches.find((m) => m.data.taxJarTaxCode.code === taxCode.code);

      if (match) {
        return match;
      }

      return {
        id: createId(),
        data: {
          saleorTaxClass: null,
          taxJarTaxCode: {
            code: taxCode.code,
            name: taxCode.name,
          },
        },
      };
    });

    return mappedTaxCodes;
  }
}
