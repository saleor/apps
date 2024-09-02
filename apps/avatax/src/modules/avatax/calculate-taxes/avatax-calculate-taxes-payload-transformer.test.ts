import { DocumentType } from "avatax/lib/enums/DocumentType";
import { describe, expect, it } from "vitest";

import { AvataxEntityTypeMatcher } from "@/modules/avatax/avatax-entity-type-matcher";
import { AvataxCalculateTaxesPayloadLinesTransformer } from "@/modules/avatax/calculate-taxes/avatax-calculate-taxes-payload-lines-transformer";
import { AvataxCalculateTaxesTaxCodeMatcher } from "@/modules/avatax/calculate-taxes/avatax-calculate-taxes-tax-code-matcher";

import { CalculateTaxesPayload } from "../../webhooks/payloads/calculate-taxes-payload";
import { AutomaticallyDistributedProductLinesDiscountsStrategy } from "../discounts";
import { AvataxCalculateTaxesMockGenerator } from "./avatax-calculate-taxes-mock-generator";
import { AvataxCalculateTaxesPayloadTransformer } from "./avatax-calculate-taxes-payload-transformer";

describe("AvataxCalculateTaxesPayloadTransformer", () => {
  it("returns document type of SalesInvoice", async () => {
    const mockGenerator = new AvataxCalculateTaxesMockGenerator();
    const avataxConfigMock = mockGenerator.generateAvataxConfig();
    const discountsStrategy = new AutomaticallyDistributedProductLinesDiscountsStrategy();

    const taxBaseMock = mockGenerator.generateTaxBase();
    const matchesMock = mockGenerator.generateTaxCodeMatches();
    const payloadMock = {
      taxBase: taxBaseMock,
      issuingPrincipal: {
        __typename: "User",
        id: "1",
      },
    } as unknown as CalculateTaxesPayload;

    const payload = await new AvataxCalculateTaxesPayloadTransformer(
      new AvataxCalculateTaxesPayloadLinesTransformer(new AvataxCalculateTaxesTaxCodeMatcher()),
      new AvataxEntityTypeMatcher({
        async getEntityUseCode() {
          // todo
          return { "@recordsetCount": 1, value: [] };
        },
      }),
    ).transform(payloadMock, avataxConfigMock, matchesMock, discountsStrategy);

    expect(payload.model.type).toBe(DocumentType.SalesOrder);
  });

  it("calculates discount amount when there are discounts", async () => {
    const mockGenerator = new AvataxCalculateTaxesMockGenerator("withDiscounts");
    const avataxConfigMock = mockGenerator.generateAvataxConfig();
    const discountsStrategy = new AutomaticallyDistributedProductLinesDiscountsStrategy();

    const taxBaseMock = mockGenerator.generateTaxBase();
    const matchesMock = mockGenerator.generateTaxCodeMatches();
    const payloadMock = {
      taxBase: taxBaseMock,
      issuingPrincipal: {
        __typename: "User",
        id: "1",
      },
    } as unknown as CalculateTaxesPayload;

    const payload = await new AvataxCalculateTaxesPayloadTransformer(
      new AvataxCalculateTaxesPayloadLinesTransformer(new AvataxCalculateTaxesTaxCodeMatcher()),
      new AvataxEntityTypeMatcher({
        async getEntityUseCode() {
          // todo
          return { "@recordsetCount": 1, value: [] };
        },
      }),
    ).transform(payloadMock, avataxConfigMock, matchesMock, discountsStrategy);

    expect(payload.model.discount).toBe(21.37);
  });
});
