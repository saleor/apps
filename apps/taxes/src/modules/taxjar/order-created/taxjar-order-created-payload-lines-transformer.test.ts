import { OrderCreatedSubscriptionFragment, OrderLineFragment } from "../../../../generated/graphql";
import { TaxJarTaxCodeMatches } from "../tax-code/taxjar-tax-code-match-repository";

import { describe, expect, it } from "vitest";
import { TaxJarOrderCreatedPayloadLinesTransformer } from "./taxjar-order-created-payload-lines-transformer";

const transformer = new TaxJarOrderCreatedPayloadLinesTransformer();

const mockedLines: OrderCreatedSubscriptionFragment["lines"] = [
  {
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
  },
  {
    productSku: "sku-2",
    productName: "Test product 2",
    quantity: 2,
    taxClass: {
      id: "tax-class-id-3",
    },
    unitPrice: {
      net: {
        amount: 15,
      },
    },
    totalPrice: {
      net: {
        amount: 30,
      },
      tax: {
        amount: 3,
      },
    },
  },
];
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

describe("TaxJarOrderCreatedPayloadLinesTransformer", () => {
  it("should map payload lines correctly", () => {
    expect(transformer.transform(mockedLines, matches)).toEqual([
      {
        quantity: 1,
        unit_price: 10,
        product_identifier: "sku",
        product_tax_code: "",
        sales_tax: 1,
        description: "Test product",
      },
      {
        quantity: 2,
        unit_price: 15,
        product_identifier: "sku-2",
        product_tax_code: "P0000001",
        sales_tax: 3,
        description: "Test product 2",
      },
    ]);
  });
});
