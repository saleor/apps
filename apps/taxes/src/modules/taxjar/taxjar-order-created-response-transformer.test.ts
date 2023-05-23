import { describe, it, expect } from "vitest";
import { TaxJarOrderCreatedResponseTransformer } from "./taxjar-order-created-response-transformer";
import { CreateOrderRes } from "taxjar/dist/types/returnTypes";

const MOCKED_ORDER: CreateOrderRes = {
  order: {
    transaction_id: "123",
    user_id: 10649,
    transaction_date: "2015-05-14T00:00:00Z",
    provider: "api",
    to_country: "US",
    to_zip: "90002",
    to_state: "CA",
    to_city: "LOS ANGELES",
    to_street: "123 Palm Grove Ln",
    amount: 16.5,
    shipping: 1.5,
    sales_tax: 0.95,
    transaction_reference_id: "123",
    exemption_type: "non_exempt",
    line_items: [
      {
        id: "1",
        quantity: 1,
        product_identifier: "12-34243-9",
        description: "Fuzzy Widget",
        unit_price: 15.0,
        discount: 0.0,
        sales_tax: 0.95,
      },
    ],
  },
};

describe("TaxJarOrderCreatedResponseTransformer", () => {
  it("returns orded id in response", () => {
    const transformer = new TaxJarOrderCreatedResponseTransformer();
    const result = transformer.transform(MOCKED_ORDER);

    expect(result).toEqual({
      id: "123",
    });
  });
});
