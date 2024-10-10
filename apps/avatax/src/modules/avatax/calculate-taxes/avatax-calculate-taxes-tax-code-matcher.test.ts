import { FragmentOf } from "gql.tada";
import { describe, expect, it } from "vitest";

import { TaxBaseLineFragment } from "../../../../graphql/fragments/TaxBase";
import { DEFAULT_TAX_CLASS_ID } from "../constants";
import { AvataxTaxCodeMatches } from "../tax-code/avatax-tax-code-match-repository";
import { AvataxCalculateTaxesTaxCodeMatcher } from "./avatax-calculate-taxes-tax-code-matcher";

const matcher = new AvataxCalculateTaxesTaxCodeMatcher();

describe("AvataxCalculateTaxesTaxCodeMatcher", () => {
  it("returns DEFAULT_TAX_CLASS_ID when tax class is not found", () => {
    const line: FragmentOf<typeof TaxBaseLineFragment> = {
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
            taxClass: null,
          },
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

    expect(matcher.match(line, matches)).toEqual(DEFAULT_TAX_CLASS_ID);
  });
  it("returns a match when tax class is found", () => {
    const line: FragmentOf<typeof TaxBaseLineFragment> = {
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
  it("throws an error when line type is not supported", () => {
    const line: FragmentOf<typeof TaxBaseLineFragment> = {
      quantity: 1,
      totalPrice: {
        amount: 1,
      },
      unitPrice: {
        amount: 1,
      },
      sourceLine: {
        id: "1",
        // @ts-expect-error: not handled typename is not typed in GraphQL
        __typename: "UnsupportedLine",
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

    expect(() => matcher.match(line, matches)).toThrowError("Unsupported line type");
  });
});
