import { TaxBaseLineFragment } from "../../../../generated/graphql";
import { AvataxTaxCodeMatches } from "../tax-code/avatax-tax-code-match-repository";
import { AvataxTaxCodeMatcher } from "./avatax-tax-code-matcher";
import { describe, expect, it } from "vitest";

const matcher = new AvataxTaxCodeMatcher();

describe("AvataxTaxCodeMatcher", () => {
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
          saleorTaxClass: null,
          avataxTaxCode: {
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
    const matches: AvataxTaxCodeMatches = [
      {
        data: {
          saleorTaxClass: {
            id: "1",
            name: "Clothing",
          },
          avataxTaxCode: {
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
