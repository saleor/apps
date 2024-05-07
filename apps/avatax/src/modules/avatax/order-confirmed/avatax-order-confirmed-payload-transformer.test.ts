import { DocumentType } from "avatax/lib/enums/DocumentType";
import { describe, expect, it } from "vitest";
import { SaleorMockOrderFactory } from "../../saleor/mock-order-factory";
import { AvataxClient } from "../avatax-client";
import { AvataxSdkClientFactory } from "../avatax-sdk-client-factory";
import { AvataxOrderConfirmedMockGenerator } from "./avatax-order-confirmed-mock-generator";
import { AvataxOrderConfirmedPayloadTransformer } from "./avatax-order-confirmed-payload-transformer";

const mockGenerator = new AvataxOrderConfirmedMockGenerator();
const saleorOrderMock = SaleorMockOrderFactory.create({ pricesEnteredWithTax: true });

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

/**
 * TODO: Dont export this, extract to shared code
 */
export const avataxConfigMock = mockGenerator.generateAvataxConfig();

const transformer = new AvataxOrderConfirmedPayloadTransformer(
  new AvataxClient(new AvataxSdkClientFactory().createClient(avataxConfigMock)),
);

describe("AvataxOrderConfirmedPayloadTransformer", () => {
  it("returns document type of SalesInvoice when isDocumentRecordingEnabled is true", async () => {
    const payload = await transformer.transform(orderMock, saleorOrderMock, avataxConfigMock, []);

    expect(payload.model.type).toBe(DocumentType.SalesInvoice);
  });
  it("returns document type of SalesOrder when isDocumentRecordingEnabled is false", async () => {
    const payload = await transformer.transform(
      orderMock,
      saleorOrderMock,
      {
        ...avataxConfigMock,
        isDocumentRecordingEnabled: false,
      },
      [],
    );

    expect(payload.model.type).toBe(DocumentType.SalesOrder);
  });
});
