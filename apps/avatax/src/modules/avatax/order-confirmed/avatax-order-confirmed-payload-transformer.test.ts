import { DocumentType } from "avatax/lib/enums/DocumentType";
import { describe, expect, it } from "vitest";

import { SaleorOrderConfirmedEventMockFactory } from "../../saleor/order-confirmed/mocks";
import { AvataxClient } from "../avatax-client";
import { AvataxSdkClientFactory } from "../avatax-sdk-client-factory";
import { PriceReductionDiscountsStrategy } from "../discounts";
import { AvataxOrderConfirmedMockGenerator } from "./avatax-order-confirmed-mock-generator";
import { AvataxOrderConfirmedPayloadTransformer } from "./avatax-order-confirmed-payload-transformer";

const mockGenerator = new AvataxOrderConfirmedMockGenerator();
const saleorOrderConfirmedEventMock = SaleorOrderConfirmedEventMockFactory.create();
const discountsStrategy = new PriceReductionDiscountsStrategy();

const orderMock = mockGenerator.generateOrder();

/**
 * TODO: Dont export this, extract to shared code
 */
export const avataxConfigMock = mockGenerator.generateAvataxConfig();

const transformer = new AvataxOrderConfirmedPayloadTransformer(
  new AvataxClient(new AvataxSdkClientFactory().createClient(avataxConfigMock)),
);

describe("AvataxOrderConfirmedPayloadTransformer", () => {
  it("returns document type of SalesInvoice when isDocumentRecordingEnabled is true", async () => {
    const payload = await transformer.transform({
      order: orderMock,
      confirmedOrderEvent: saleorOrderConfirmedEventMock,
      avataxConfig: avataxConfigMock,
      matches: [],
      discountsStrategy,
    });

    expect(payload.model.type).toBe(DocumentType.SalesInvoice);
  });
  it("returns document type of SalesOrder when isDocumentRecordingEnabled is false", async () => {
    const payload = await transformer.transform({
      order: orderMock,
      confirmedOrderEvent: saleorOrderConfirmedEventMock,
      avataxConfig: {
        ...avataxConfigMock,
        isDocumentRecordingEnabled: false,
      },
      matches: [],
      discountsStrategy,
    });

    expect(payload.model.type).toBe(DocumentType.SalesOrder);
  });
});
