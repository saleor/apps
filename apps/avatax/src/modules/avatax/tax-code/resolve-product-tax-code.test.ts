import { describe, expect, it } from "vitest";

import { type AvataxTaxCodeMatches } from "./avatax-tax-code-match-repository";
import { resolveProductTaxCode } from "./resolve-product-tax-code";

const matches: AvataxTaxCodeMatches = [
  { id: "1", data: { saleorTaxClassId: "tax-class-clothing", avataxTaxCode: "PC040100" } },
];

describe("resolveProductTaxCode", () => {
  it("returns assigned code when the product's tax class is mapped", () => {
    const result = resolveProductTaxCode({ id: "tax-class-clothing", name: "Clothing" }, matches);

    expect(result).toStrictEqual({
      status: "assigned",
      taxClassId: "tax-class-clothing",
      taxClassName: "Clothing",
      avataxTaxCode: "PC040100",
    });
  });

  it("returns unmapped when the product has a tax class with no mapping", () => {
    const result = resolveProductTaxCode({ id: "tax-class-food", name: "Food" }, matches);

    expect(result).toStrictEqual({
      status: "unmapped",
      taxClassId: "tax-class-food",
      taxClassName: "Food",
    });
  });

  it("returns no-tax-class when the product has no tax class", () => {
    expect(resolveProductTaxCode(null, matches)).toStrictEqual({ status: "no-tax-class" });
    expect(resolveProductTaxCode(undefined, matches)).toStrictEqual({ status: "no-tax-class" });
  });
});
