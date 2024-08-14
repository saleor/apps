import { describe, expect, it } from "vitest";

import { SaleorOrderConfirmedEvent } from "./event";
import { SaleorOrderConfirmedEventMockFactory } from "./mocks";

describe("SaleorOrderConfirmedEvent", () => {
  it("should create a SaleorOrderConfirmedEvent from a valid payload", () => {
    const payload = SaleorOrderConfirmedEventMockFactory.getGraphqlPayload();
    const result = SaleorOrderConfirmedEvent.createFromGraphQL(payload);

    expect(result.isOk()).toBe(true);

    expect(result._unsafeUnwrap()).toBeInstanceOf(SaleorOrderConfirmedEvent);
  });

  it("should fail to create a SaleorOrderConfirmedEvent when 'order' is missing", () => {
    const payload = SaleorOrderConfirmedEventMockFactory.getGraphqlPayload();
    const result = SaleorOrderConfirmedEvent.createFromGraphQL({
      ...payload,
      order: undefined,
    });

    expect(result.isErr()).toBe(true);

    if (result.isErr()) {
      expect(result.error).toBeInstanceOf(SaleorOrderConfirmedEvent.ParsingError);
    }
  });

  describe("isFulfilled method", () => {
    it("should return true if order has status FULLFILLED", () => {
      const payload = SaleorOrderConfirmedEventMockFactory.getGraphqlPayload();
      const event = SaleorOrderConfirmedEvent.createFromGraphQL(payload)._unsafeUnwrap();

      expect(event.isFulfilled()).toBe(true);
    });

    it("should return false if order has other status than FULLFILLED", () => {
      const payload = SaleorOrderConfirmedEventMockFactory.getGraphqlPayload();
      const event = SaleorOrderConfirmedEvent.createFromGraphQL({
        ...payload,
        order: {
          ...payload.order,
          status: "CANCELED",
        },
      })._unsafeUnwrap();

      expect(event.isFulfilled()).toBe(false);
    });
  });

  describe("isStrategyFlatRates method", () => {
    it("should return false if order has tax calculation startegy set to TAX_APP", () => {
      const payload = SaleorOrderConfirmedEventMockFactory.getGraphqlPayload();
      const event = SaleorOrderConfirmedEvent.createFromGraphQL(payload)._unsafeUnwrap();

      expect(event.isStrategyFlatRates()).toBe(false);
    });

    it("should return true if order has tax calculation startegy set to FLAT_RATES", () => {
      const payload = SaleorOrderConfirmedEventMockFactory.getGraphqlPayload();
      const event = SaleorOrderConfirmedEvent.createFromGraphQL({
        ...payload,
        order: {
          ...payload.order,
          channel: {
            slug: "channel-slug",
            id: "channel-id",
            taxConfiguration: {
              pricesEnteredWithTax: true,
              taxCalculationStrategy: "FLAT_RATES",
            },
          },
        },
      })._unsafeUnwrap();

      expect(event.isStrategyFlatRates()).toBe(true);
    });
  });

  describe("hasShipping method", () => {
    it("should return false if order has shippingPrice net set to 0", () => {
      const payload = SaleorOrderConfirmedEventMockFactory.getGraphqlPayload();
      const event = SaleorOrderConfirmedEvent.createFromGraphQL({
        ...payload,
        order: {
          ...payload.order,
          shippingPrice: {
            gross: {
              amount: 10,
            },
            net: {
              amount: 0,
            },
          },
        },
      })._unsafeUnwrap();

      expect(event.hasShipping()).toEqual(false);
    });

    it("should return true if order has shippingPrice net set to value other than 0", () => {
      const payload = SaleorOrderConfirmedEventMockFactory.getGraphqlPayload();
      const event = SaleorOrderConfirmedEvent.createFromGraphQL(payload)._unsafeUnwrap();

      expect(event.hasShipping()).toEqual(true);
    });
  });

  describe("getShippingAmount method", () => {
    it("should get shipping amount as shippingPrice gross with tax included", () => {
      const payload = SaleorOrderConfirmedEventMockFactory.getGraphqlPayload();
      const event = SaleorOrderConfirmedEvent.createFromGraphQL(payload)._unsafeUnwrap();

      expect(event.getShippingAmount()).toEqual(payload.order.shippingPrice.gross.amount);
    });

    it("should get shipping amount as shippingPrice net without tax included", () => {
      const payload = SaleorOrderConfirmedEventMockFactory.getGraphqlPayload();
      const event = SaleorOrderConfirmedEvent.createFromGraphQL({
        ...payload,
        order: {
          ...payload.order,
          channel: {
            slug: "channel-slug",
            id: "channel-id",
            taxConfiguration: {
              pricesEnteredWithTax: false,
              taxCalculationStrategy: "FLAT_RATES",
            },
          },
        },
      })._unsafeUnwrap();

      expect(event.getShippingAmount()).toEqual(payload.order.shippingPrice.net.amount);
    });
  });
});
