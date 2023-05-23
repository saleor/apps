import { describe, expect, it } from "vitest";
import { taxJarMockFactory } from "./taxjar-mock-factory";
import { TaxJarOrderCreatedResponseTransformer } from "./taxjar-order-created-response-transformer";

const MOCKED_ORDER = taxJarMockFactory.createMockTaxJarOrder();

describe("TaxJarOrderCreatedResponseTransformer", () => {
  it("returns orded id in response", () => {
    const transformer = new TaxJarOrderCreatedResponseTransformer();
    const result = transformer.transform(MOCKED_ORDER);

    expect(result).toEqual({
      id: "123",
    });
  });
});
