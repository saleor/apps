import { DocumentType } from "avatax/lib/enums/DocumentType";
import { describe, expect, it } from "vitest";
import { SaleorOrderConfirmedEventMockFactory } from "../../saleor/order-confirmed/mocks";
import { AvataxClient } from "../avatax-client";
import { AvataxSdkClientFactory } from "../avatax-sdk-client-factory";
import { AvataxOrderConfirmedMockGenerator } from "./avatax-order-confirmed-mock-generator";
import { AvataxOrderConfirmedPayloadTransformer } from "./avatax-order-confirmed-payload-transformer";

const mockGenerator = new AvataxOrderConfirmedMockGenerator();
const saleorOrderConfirmedEventMock = SaleorOrderConfirmedEventMockFactory.create();

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
    const payload = await transformer.transform({
      order: orderMock,
      confirmedOrderEvent: saleorOrderConfirmedEventMock,
      avataxConfig: avataxConfigMock,
      matches: [],
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
    });

    expect(payload.model.type).toBe(DocumentType.SalesOrder);
  });

  it("returns lines with discounted: true when there are discounts", async () => {
    const mockedOrderConfirmedGraphQLPayload =
      SaleorOrderConfirmedEventMockFactory.getGraphqlPayload();

    const saleorOrderConfirmedEventMockWithDiscounts = SaleorOrderConfirmedEventMockFactory.create({
      ...mockedOrderConfirmedGraphQLPayload,
      order: {
        ...mockedOrderConfirmedGraphQLPayload.order,
        discounts: [
          {
            amount: {
              amount: 10,
            },
            id: "RGlzY291bnREaXNjb3VudDox",
          },
        ],
      },
    });
    const payload = await transformer.transform({
      order: discountedOrderMock,
      confirmedOrderEvent: saleorOrderConfirmedEventMockWithDiscounts,
      avataxConfig: avataxConfigMock,
      matches: [],
    });

    const linesWithoutShipping = payload.model.lines.slice(0, -1);
    const check = linesWithoutShipping.every((line) => line.discounted === true);

    expect(check).toBe(true);
  });

  it("returns lines with discounted: false when there are no discounts", async () => {
    const transformer = new AvataxOrderConfirmedPayloadTransformer(
      new AvataxClient(new AvataxSdkClientFactory().createClient(avataxConfigMock)),
    );
    const payload = await transformer.transform({
      order: orderMock,
      confirmedOrderEvent: saleorOrderConfirmedEventMock,
      avataxConfig: avataxConfigMock,
      matches: [],
    });

    const linesWithoutShipping = payload.model.lines.slice(0, -1);
    const check = linesWithoutShipping.every((line) => line.discounted === false);

    expect(check).toBe(true);
  });
});
