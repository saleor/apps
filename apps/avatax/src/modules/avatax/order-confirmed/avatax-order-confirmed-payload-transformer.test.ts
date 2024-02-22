import { describe, expect, it } from "vitest";
import { AvataxOrderConfirmedMockGenerator } from "./avatax-order-confirmed-mock-generator";
import {
  transformAvataxOrderConfirmedPayload,
  resolveAvataxCalculationDate,
} from "./avatax-order-confirmed-payload-transformer";
import { DocumentType } from "avatax/lib/enums/DocumentType";
import { OrderConfirmedSubscriptionFragment } from "../../../../generated/graphql";

const mockGenerator = new AvataxOrderConfirmedMockGenerator();

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

const avataxConfigMock = mockGenerator.generateAvataxConfig();

describe("AvataxOrderConfirmedPayloadTransformer", () => {
  it("returns document type of SalesInvoice when isDocumentRecordingEnabled is true", async () => {
    const payload = await transformAvataxOrderConfirmedPayload(orderMock, avataxConfigMock, []);

    expect(payload.model.type).toBe(DocumentType.SalesInvoice);
  }),
    it("returns document type of SalesOrder when isDocumentRecordingEnabled is false", async () => {
      const payload = await transformAvataxOrderConfirmedPayload(
        orderMock,
        {
          ...avataxConfigMock,
          isDocumentRecordingEnabled: false,
        },
        [],
      );

      expect(payload.model.type).toBe(DocumentType.SalesOrder);
    });
  it("returns lines with discounted: true when there are discounts", async () => {
    const payload = await transformAvataxOrderConfirmedPayload(
      discountedOrderMock,
      avataxConfigMock,
      [],
    );

    const linesWithoutShipping = payload.model.lines.slice(0, -1);
    const check = linesWithoutShipping.every((line) => line.discounted === true);

    expect(check).toBe(true);
  });
  it("returns lines with discounted: false when there are no discounts", async () => {
    const payload = await transformAvataxOrderConfirmedPayload(orderMock, avataxConfigMock, []);

    const linesWithoutShipping = payload.model.lines.slice(0, -1);
    const check = linesWithoutShipping.every((line) => line.discounted === false);

    expect(check).toBe(true);
  });
});

describe("AvataxCalculationDateResolver", () => {
  it("should return the metadata tax calculation date if it is set", () => {
    const order = {
      avataxTaxCalculationDate: "2021-01-01T00:00:00.000Z",
      created: "2021-01-02T00:00:00.000Z",
    } as any as OrderConfirmedSubscriptionFragment;

    expect(resolveAvataxCalculationDate(order.avataxTaxCalculationDate, order.created)).toEqual(
      new Date("2021-01-01T00:00:00.000Z"),
    );
  });
  it("should fallback to order created when metadata tax calculation date is not a string datetime", () => {
    const order = {
      avataxTaxCalculationDate: "not-a-datetime",
      created: "2021-01-02T00:00:00.000Z",
    } as any as OrderConfirmedSubscriptionFragment;

    expect(resolveAvataxCalculationDate(order.avataxTaxCalculationDate, order.created)).toEqual(
      new Date("2021-01-02T00:00:00.000Z"),
    );
  });
  it("should return the order creation date if the metadata tax calculation date is not set", () => {
    const order = {
      created: "2021-01-02T00:00:00.000Z",
    } as any as OrderConfirmedSubscriptionFragment;

    expect(resolveAvataxCalculationDate(order.avataxTaxCalculationDate, order.created)).toEqual(
      new Date("2021-01-02T00:00:00.000Z"),
    );
  });
});
