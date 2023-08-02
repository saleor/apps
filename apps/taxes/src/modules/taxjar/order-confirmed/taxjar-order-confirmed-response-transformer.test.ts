import { describe, expect, it } from "vitest";
import { TaxJarOrderConfirmedMockGenerator } from "./taxjar-order-confirmed-mock-generator";
import { TaxJarOrderConfirmedResponseTransformer } from "./taxjar-order-confirmed-response-transformer";

describe("TaxJarOrderConfirmedResponseTransformer", () => {
  it("returns orded id in response", () => {
    const mockGenerator = new TaxJarOrderConfirmedMockGenerator();
    const responseMock = mockGenerator.generateResponse();
    const transformer = new TaxJarOrderConfirmedResponseTransformer();
    const result = transformer.transform(responseMock);

    expect(result).toEqual({
      id: "T3JkZXI6ZTUzZTBlM2MtMjk5Yi00OWYxLWIyZDItY2Q4NWExYTgxYjY2",
    });
  });
});
