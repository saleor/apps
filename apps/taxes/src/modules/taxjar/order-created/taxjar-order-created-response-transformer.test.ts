import { describe, expect, it } from "vitest";
import { TaxJarOrderCreatedMockGenerator } from "./taxjar-order-created-mock-generator";
import { TaxJarOrderCreatedResponseTransformer } from "./taxjar-order-created-response-transformer";

describe("TaxJarOrderCreatedResponseTransformer", () => {
  it("returns orded id in response", () => {
    const mockGenerator = new TaxJarOrderCreatedMockGenerator();
    const responseMock = mockGenerator.generateResponse();
    const transformer = new TaxJarOrderCreatedResponseTransformer();
    const result = transformer.transform(responseMock);

    expect(result).toEqual({
      id: "T3JkZXI6ZTUzZTBlM2MtMjk5Yi00OWYxLWIyZDItY2Q4NWExYTgxYjY2",
    });
  });
});
