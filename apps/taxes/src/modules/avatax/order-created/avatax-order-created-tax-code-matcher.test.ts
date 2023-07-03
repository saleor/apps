import { OrderLineFragment } from "../../../../generated/graphql";
import { describe, expect, it } from "vitest";
import { AvataxTaxCodeMatches } from "../tax-code/avatax-tax-code-match-repository";
import { AvataxOrderCreatedTaxCodeMatcher } from "./avatax-order-created-tax-code-matcher";

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

const matches: AvataxTaxCodeMatches = [
  {
    data: {
      saleorTaxClassId: "tax-class-id",
      avataxTaxCode: "P0000000",
    },
    id: "id-1",
  },
  {
    data: {
      saleorTaxClassId: "tax-class-id-3",
      avataxTaxCode: "P0000001",
    },
    id: "id-2",
  },
];

describe("AvataxOrderCreatedTaxCodeMatcher", () => {
  it("should return empty string if tax class is not found", () => {
    const matcher = new AvataxOrderCreatedTaxCodeMatcher();

    expect(matcher.match(mockedLine, matches)).toEqual("");
  });
  it("should return tax code if tax class is found", () => {
    const line = structuredClone({ ...mockedLine, taxClass: { id: "tax-class-id" } });
    const matcher = new AvataxOrderCreatedTaxCodeMatcher();

    expect(matcher.match(line, matches)).toEqual("P0000000");
  });
});
