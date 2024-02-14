import { describe, expect, it } from "vitest";
import { TaxJarCalculateTaxesMockGenerator } from "./taxjar-calculate-taxes-mock-generator";
import { matchPayloadLinesToResponseLines } from "./taxjar-calculate-taxes-response-lines-transformer";

describe("matchPayloadLinesToResponseLines", () => {
  it("shold return the response lines in the order of payload lines", () => {
    const mockGenerator = new TaxJarCalculateTaxesMockGenerator("with_nexus_tax_included");
    const responseMock = mockGenerator.generateResponse();
    const payloadMock = mockGenerator.generateTaxBase();

    const payloadLines = payloadMock.lines;
    const responseLines = responseMock.tax.breakdown?.line_items ?? [];

    const [first, second, third] = matchPayloadLinesToResponseLines(payloadLines, responseLines);

    expect(first!.id).toBe(payloadLines[0].sourceLine.id);
    expect(second!.id).toBe(payloadLines[1].sourceLine.id);
    expect(third!.id).toBe(payloadLines[2].sourceLine.id);
  });
  it("throws error if there is no match for a payload line in response lines", () => {
    const mockGenerator = new TaxJarCalculateTaxesMockGenerator("with_nexus_tax_included");
    const responseMock = mockGenerator.generateResponse();
    const payloadMock = mockGenerator.generateTaxBase();

    const payloadLines = payloadMock.lines;
    const responseLines = (responseMock.tax.breakdown?.line_items ?? []).slice(0, 2);

    expect(() => matchPayloadLinesToResponseLines(payloadLines, responseLines)).toThrowError(
      `Saleor product line with id ${payloadLines[2].sourceLine.id} not found in TaxJar response.`,
    );
  });
});
