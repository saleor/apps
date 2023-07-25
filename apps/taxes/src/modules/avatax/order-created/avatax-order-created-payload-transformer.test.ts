import { describe, expect, it } from "vitest";
import { AvataxOrderCreatedMockGenerator } from "./avatax-order-created-mock-generator";
import { AvataxOrderCreatedPayloadTransformer } from "./avatax-order-created-payload-transformer";
import { DocumentType } from "avatax/lib/enums/DocumentType";

const mockGenerator = new AvataxOrderCreatedMockGenerator();

const orderMock = mockGenerator.generateOrder();
const discountedOrderMock = mockGenerator.generateOrder({
  discounts: [
    {
      amount: {
        amount: 10,
      },
      id: "RGlzY291bnREaXNjb3VudDox",
    },
  ],
});

const transformer = new AvataxOrderCreatedPayloadTransformer();

export const avataxConfigMock = mockGenerator.generateAvataxConfig();

describe("AvataxOrderCreatedPayloadTransformer", () => {
  it("returns document type of SalesInvoice when isDocumentRecordingEnabled is true", async () => {
    const payload = await transformer.transform(orderMock, avataxConfigMock, []);

    expect(payload.model.type).toBe(DocumentType.SalesInvoice);
  }),
    it("returns document type of SalesOrder when isDocumentRecordingEnabled is false", async () => {
      const payload = await transformer.transform(
        orderMock,
        {
          ...avataxConfigMock,
          isDocumentRecordingEnabled: false,
        },
        []
      );

      expect(payload.model.type).toBe(DocumentType.SalesOrder);
    });
  it("returns lines with discounted: true when there are discounts", async () => {
    const payload = await transformer.transform(discountedOrderMock, avataxConfigMock, []);

    const linesWithoutShipping = payload.model.lines.slice(0, -1);
    const check = linesWithoutShipping.every((line) => line.discounted === true);

    expect(check).toBe(true);
  });
  it("returns lines with discounted: false when there are no discounts", async () => {
    const transformer = new AvataxOrderCreatedPayloadTransformer();
    const payload = await transformer.transform(orderMock, avataxConfigMock, []);

    const linesWithoutShipping = payload.model.lines.slice(0, -1);
    const check = linesWithoutShipping.every((line) => line.discounted === false);

    expect(check).toBe(true);
  });
});
