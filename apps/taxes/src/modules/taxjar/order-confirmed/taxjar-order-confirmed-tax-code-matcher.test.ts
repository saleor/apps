import { OrderLineFragment } from "../../../../generated/graphql";
import { TaxJarTaxCodeMatches } from "../tax-code/taxjar-tax-code-match-repository";
import { TaxJarOrderConfirmedTaxCodeMatcher } from "./taxjar-order-confirmed-tax-code-matcher";
import { describe, expect, it } from "vitest";

const mockedLine: OrderLineFragment = {
  productSku: "sku",
  productName: "Test product",
  quantity: 1,
  taxClass: {
    id: "tax-class-id-2",
  },
  unitPrice: {
    net: {
      amount: 10,
    },
  },
  totalPrice: {
    net: {
      amount: 10,
    },
    tax: {
      amount: 1,
    },
  },
};

const matches: TaxJarTaxCodeMatches = [
  {
    data: {
      saleorTaxClassId: "tax-class-id",
      taxJarTaxCode: "P0000000",
    },
    id: "id-1",
  },
  {
    data: {
      saleorTaxClassId: "tax-class-id-3",
      taxJarTaxCode: "P0000001",
    },
    id: "id-2",
  },
];

describe("TaxJarOrderConfirmedTaxCodeMatcher", () => {
  it("should return empty string if tax class is not found", () => {
    const matcher = new TaxJarOrderConfirmedTaxCodeMatcher();

    expect(matcher.match(mockedLine, matches)).toEqual("");
  });
  it("should return tax code if tax class is found", () => {
    const line = structuredClone({ ...mockedLine, taxClass: { id: "tax-class-id" } });
    const matcher = new TaxJarOrderConfirmedTaxCodeMatcher();

    expect(matcher.match(line, matches)).toEqual("P0000000");
  });
});
