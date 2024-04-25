import { OrderStatus } from "@saleor/webhook-utils/generated/graphql";
import { describe, expect, it } from "vitest";
import { SaleorOrderConfirmedEvent } from "./event";
import { SaleorOrderConfirmedEventFactory } from "./mocks";

describe("SaleorOrderConfirmedEvent", () => {
  const validPayload = SaleorOrderConfirmedEventFactory.graphqlPayload;

  it("should create a SaleorOrderConfirmedEvent from a valid payload", () => {
    const result = SaleorOrderConfirmedEvent.createFromGraphQL(validPayload);

    expect(result.isOk()).toBe(true);

    expect(result._unsafeUnwrap()).toBeInstanceOf(SaleorOrderConfirmedEvent);
  });

  it("should fail to create a SaleorOrderConfirmedEvent when 'order' is missing", () => {
    const result = SaleorOrderConfirmedEvent.createFromGraphQL({
      ...validPayload,
      order: undefined,
    });

    expect(result.isErr()).toBe(true);

    if (result.isErr()) {
      expect(result.error).toBeInstanceOf(SaleorOrderConfirmedEvent.ParsingError);
    }
  });

  describe("isFulfilled method", () => {
    it("should return true if order has status FULLFILLED", () => {
      const event = SaleorOrderConfirmedEvent.createFromGraphQL(validPayload)._unsafeUnwrap();

      expect(event.isFulfilled()).toBe(true);
    });

    it("should return false if order has other status than FULLFILLED", () => {
      const event = SaleorOrderConfirmedEvent.createFromGraphQL({
        ...validPayload,
        order: {
          ...validPayload.order,
          status: OrderStatus.Canceled,
        },
      })._unsafeUnwrap();

      expect(event.isFulfilled()).toBe(false);
    });
  });

  describe("isStrategyFlatRates method", () => {
    it("should return false if order has tax calculation startegy set to TAX_APP", () => {
      const event = SaleorOrderConfirmedEvent.createFromGraphQL(validPayload)._unsafeUnwrap();

      expect(event.isStrategyFlatRates()).toBe(false);
    });

    it("should return true if order has tax calculation startegy set to FLAT_RATES", () => {
      const event = SaleorOrderConfirmedEvent.createFromGraphQL({
        ...validPayload,
        order: {
          ...validPayload.order,
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

  describe("getIsDiscounted method", () => {
    it("should return false if order don't have discounts", () => {
      const event = SaleorOrderConfirmedEvent.createFromGraphQL(validPayload)._unsafeUnwrap();

      expect(event.getIsDiscounted()).toEqual(false);
    });

    it("should return true if order have discounts", () => {
      const event = SaleorOrderConfirmedEvent.createFromGraphQL({
        ...validPayload,
        order: {
          ...validPayload.order,
          discounts: [{ id: "discount-id", amount: { amount: 10 } }],
        },
      })._unsafeUnwrap();

      expect(event.getIsDiscounted()).toEqual(true);
    });
  });

  describe("hasShipping method", () => {
    it("should return false if order has shippingPrice net set to 0", () => {
      const event = SaleorOrderConfirmedEvent.createFromGraphQL({
        ...validPayload,
        order: {
          ...validPayload.order,
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
      const event = SaleorOrderConfirmedEvent.createFromGraphQL(validPayload)._unsafeUnwrap();

      expect(event.hasShipping()).toEqual(true);
    });
  });

  describe("getShippingAmount method", () => {
    it("should get shipping amount as shippingPrice gross with tax included", () => {
      const event = SaleorOrderConfirmedEvent.createFromGraphQL(validPayload)._unsafeUnwrap();

      expect(event.getShippingAmount()).toEqual(validPayload.order.shippingPrice.gross.amount);
    });

    it("should get shipping amount as shippingPrice net without tax included", () => {
      const event = SaleorOrderConfirmedEvent.createFromGraphQL({
        ...validPayload,
        order: {
          ...validPayload.order,
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

      expect(event.getShippingAmount()).toEqual(validPayload.order.shippingPrice.net.amount);
    });
  });
});
