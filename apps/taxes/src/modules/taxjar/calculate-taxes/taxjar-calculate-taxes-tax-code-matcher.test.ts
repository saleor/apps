import { TaxBaseLineFragment } from "../../../../generated/graphql";
import { TaxJarTaxCodeMatches } from "../tax-code/taxjar-tax-code-match-repository";
import { TaxJarCalculateTaxesTaxCodeMatcher } from "./taxjar-calculate-taxes-tax-code-matcher";
import { describe, expect, it } from "vitest";

const matcher = new TaxJarCalculateTaxesTaxCodeMatcher();

describe("TaxJarCalculateTaxesTaxCodeMatcher", () => {
  it("returns empty string when tax class is not found", () => {
    const line: TaxBaseLineFragment = {
      quantity: 1,
      totalPrice: {
        amount: 1,
      },
      unitPrice: {
        amount: 1,
      },
      sourceLine: {
        id: "1",
        __typename: "OrderLine",
        orderProductVariant: {
          id: "1",
          product: {},
        },
      },
    };
    const matches: TaxJarTaxCodeMatches = [
      {
        data: {
          saleorTaxClassId: "",
          taxJarTaxCode: "1",
        },
        id: "1",
      },
    ];

    expect(matcher.match(line, matches)).toEqual("");
  });
  it("returns a match when tax class is found", () => {
    const line: TaxBaseLineFragment = {
      quantity: 1,
      totalPrice: {
        amount: 1,
      },
      unitPrice: {
        amount: 1,
      },
      sourceLine: {
        id: "1",
        __typename: "OrderLine",
        orderProductVariant: {
          id: "1",
          product: {
            taxClass: {
              name: "Clothing",
              id: "1",
            },
          },
        },
      },
    };
    const matches: TaxJarTaxCodeMatches = [
      {
        data: {
          saleorTaxClassId: "1",
          taxJarTaxCode: "123412",
        },
        id: "1",
      },
    ];

    const taxCode = matcher.match(line, matches);

    expect(taxCode).toEqual("123412");
  });
});
