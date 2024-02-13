import { TaxBaseLineFragment } from "../../../../generated/graphql";
import { AvataxTaxCodeMatches } from "../tax-code/avatax-tax-code-match-repository";
import { AvataxCalculateTaxesTaxCodeMatcher } from "./avatax-calculate-taxes-tax-code-matcher";
import { describe, expect, it } from "vitest";

const matcher = new AvataxCalculateTaxesTaxCodeMatcher();

describe("AvataxCalculateTaxesTaxCodeMatcher", () => {
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
    const matches: AvataxTaxCodeMatches = [
      {
        data: {
          saleorTaxClassId: "",
          avataxTaxCode: "1",
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
    const matches: AvataxTaxCodeMatches = [
      {
        data: {
          saleorTaxClassId: "1",
          avataxTaxCode: "123412",
        },
        id: "1",
      },
    ];

    const taxCode = matcher.match(line, matches);

    expect(taxCode).toEqual("123412");
  });
});
