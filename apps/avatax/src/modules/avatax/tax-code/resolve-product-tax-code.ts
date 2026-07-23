import { type AvataxTaxCodeMatches } from "./avatax-tax-code-match-repository";

type ProductTaxClass = { id: string; name: string } | null | undefined;

/**
 * Resolves which AvaTax tax code a product will be taxed with, based on the
 * product's Saleor tax class and the app's tax-class → AvaTax-code mapping.
 *
 * - `assigned`: tax class is mapped to an AvaTax code (the code that will be used)
 * - `unmapped`: product has a tax class, but no mapping exists → AvaTax default is used
 * - `no-tax-class`: product has no tax class → AvaTax default is used
 */
export type ProductTaxCodeResolution =
  | { status: "assigned"; taxClassId: string; taxClassName: string; avataxTaxCode: string }
  | { status: "unmapped"; taxClassId: string; taxClassName: string }
  | { status: "no-tax-class" };

export const resolveProductTaxCode = (
  taxClass: ProductTaxClass,
  matches: AvataxTaxCodeMatches,
): ProductTaxCodeResolution => {
  if (!taxClass) {
    return { status: "no-tax-class" };
  }

  const match = matches.find((m) => m.data.saleorTaxClassId === taxClass.id);

  if (!match) {
    return { status: "unmapped", taxClassId: taxClass.id, taxClassName: taxClass.name };
  }

  return {
    status: "assigned",
    taxClassId: taxClass.id,
    taxClassName: taxClass.name,
    avataxTaxCode: match.data.avataxTaxCode,
  };
};
