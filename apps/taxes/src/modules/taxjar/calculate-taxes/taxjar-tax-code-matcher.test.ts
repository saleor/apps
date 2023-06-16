import { TaxBaseLineFragment } from "../../../../generated/graphql";
import { TaxJarTaxCodeMatches } from "../tax-code/taxjar-tax-code-match-repository";
import { TaxJarTaxCodeMatcher } from "./taxjar-tax-code-matcher";
import { describe, expect, it } from "vitest";

const matcher = new TaxJarTaxCodeMatcher();

describe("TaxJarTaxCodeMatcher", () => {
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
          saleorTaxClass: null,
          taxJarTaxCode: {
            code: "1",
            name: "Clothing",
          },
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
          saleorTaxClass: {
            id: "1",
            name: "Clothing",
          },
          taxJarTaxCode: {
            code: "123412",
            name: "Clothes",
          },
        },
        id: "1",
      },
    ];

    const taxCode = matcher.match(line, matches);

    expect(taxCode).toEqual("123412");
  });
});
