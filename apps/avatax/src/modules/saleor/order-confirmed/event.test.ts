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
      order: null,
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

      payload.order!.status = "CANCELED";

      const event = SaleorOrderConfirmedEvent.createFromGraphQL(payload)._unsafeUnwrap();

      expect(event.isFulfilled()).toBe(false);
    });
  });

  describe("isStrategyFlatRates method", () => {
    it("should return false if order has tax calculation strategy set to TAX_APP", () => {
      const payload = SaleorOrderConfirmedEventMockFactory.getGraphqlPayload();
      const event = SaleorOrderConfirmedEvent.createFromGraphQL(payload)._unsafeUnwrap();

      expect(event.isStrategyFlatRates()).toBe(false);
    });

    it("should return true if order has tax calculation strategy set to FLAT_RATES", () => {
      const payload = SaleorOrderConfirmedEventMockFactory.getGraphqlPayload();

      payload.order!.channel = {
        slug: "channel-slug",
        id: "channel-id",
        taxConfiguration: {
          pricesEnteredWithTax: true,
          taxCalculationStrategy: "FLAT_RATES",
        },
      };

      const event = SaleorOrderConfirmedEvent.createFromGraphQL(payload)._unsafeUnwrap();

      expect(event.isStrategyFlatRates()).toBe(true);
    });
  });

  describe("hasShipping method", () => {
    it("should return false if order has shippingPrice net set to 0", () => {
      const payload = SaleorOrderConfirmedEventMockFactory.getGraphqlPayload();

      payload.order!.shippingPrice = {
        gross: {
          amount: 10,
        },
        net: {
          amount: 0,
        },
      };

      const event = SaleorOrderConfirmedEvent.createFromGraphQL(payload)._unsafeUnwrap();

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

      expect(event.getShippingAmount()).toEqual(payload.order!.shippingPrice.gross.amount);
    });

    it("should get shipping amount as shippingPrice net without tax included", () => {
      const payload = SaleorOrderConfirmedEventMockFactory.getGraphqlPayload();

      payload.order!.channel = {
        slug: "channel-slug",
        id: "channel-id",
        taxConfiguration: {
          pricesEnteredWithTax: false,
          taxCalculationStrategy: "FLAT_RATES",
        },
      };

      const event = SaleorOrderConfirmedEvent.createFromGraphQL(payload)._unsafeUnwrap();

      expect(event.getShippingAmount()).toEqual(payload.order!.shippingPrice.net.amount);
    });
  });

  describe("resolveUserEmailOrEmpty", () => {
    it("Returns order.user.email if exists", () => {
      const payload = SaleorOrderConfirmedEventMockFactory.getGraphqlPayload();

      payload.order!.user = {
        email: "a@b.com",
        id: "1",
        avataxCustomerCode: null,
      };

      payload.order!.userEmail = "another@another.com";

      const result = SaleorOrderConfirmedEvent.createFromGraphQL(payload);

      expect(result._unsafeUnwrap().resolveUserEmailOrEmpty()).toBe("a@b.com");
    });

    it("Returns order.userEmail.email if exists and user.email doesnt", () => {
      const payload = SaleorOrderConfirmedEventMockFactory.getGraphqlPayload();

      payload.order!.user = null;

      payload.order!.userEmail = "another@another.com";

      const result = SaleorOrderConfirmedEvent.createFromGraphQL(payload);

      expect(result._unsafeUnwrap().resolveUserEmailOrEmpty()).toBe("another@another.com");
    });

    it("Returns empty string if neither user.email or userEmail exist", () => {
      const payload = SaleorOrderConfirmedEventMockFactory.getGraphqlPayload();

      payload.order!.user = null;
      payload.order!.userEmail = null;

      const result = SaleorOrderConfirmedEvent.createFromGraphQL(payload);

      expect(result._unsafeUnwrap().resolveUserEmailOrEmpty()).toBe("");
    });
  });

  describe("Resolving addresses", () => {
    const payload = SaleorOrderConfirmedEventMockFactory.getGraphqlPayload();

    payload.order!.shippingAddress = {
      streetAddress2: "streetAddress2-shipping",
      city: "city-shipping",
      postalCode: "postalCode-shipping",
      country: {
        code: "US",
      },
      countryArea: "countryArea-shipping",
      streetAddress1: "streetAddress1-shipping",
    };

    payload.order!.billingAddress = {
      streetAddress2: "streetAddress2-billing",
      city: "city-billing",
      postalCode: "postalCode-billing",
      country: {
        code: "US",
      },
      countryArea: "countryArea-billing",
      streetAddress1: "streetAddress1-billing",
    };

    const event = SaleorOrderConfirmedEvent.createFromGraphQL(payload)._unsafeUnwrap();

    it("Returns shipping address", () => {
      expect(event.getOrderShippingAddress()).toEqual(payload.order!.shippingAddress);
    });

    it("Returns billing address", () => {
      expect(event.getOrderBillingAddress()).toEqual(payload.order!.billingAddress);
    });
  });
});
