import { describe, expect, it } from "vitest";
import { SaleorCalculateTaxesEvent } from "./event";
import { SaleorCalculateTaxesEventMockFactory } from "./mocks";

describe("SaleorCalculateTaxesEvent", () => {
  it("should create a SaleorCalculateTaxesEvent from a valid payload", () => {
    const payload = SaleorCalculateTaxesEventMockFactory.getGraphqlPayload();
    const result = SaleorCalculateTaxesEvent.createFromGraphQL(payload);

    expect(result.isOk()).toBe(true);

    expect(result._unsafeUnwrap()).toBeInstanceOf(SaleorCalculateTaxesEvent);
  });

  it("should fail to create a SaleorCalculateTaxesEvent when there are two discount objects", () => {
    const payload = SaleorCalculateTaxesEventMockFactory.getGraphqlPayload();
    const result = SaleorCalculateTaxesEvent.createFromGraphQL({
      ...payload,
      taxBase: {
        ...payload.taxBase,
        discounts: [
          {
            amount: {
              amount: 10,
            },
          },
          {
            amount: {
              amount: 20,
            },
          },
        ],
      },
    });

    expect(result.isErr()).toBe(true);

    expect(result._unsafeUnwrapErr()).toBeInstanceOf(SaleorCalculateTaxesEvent.ParsingError);
  });

  describe("getDiscountAmount method", () => {
    it("should return fallback discount amount if there are no discounts", () => {
      const payload = SaleorCalculateTaxesEventMockFactory.getGraphqlPayload();
      const event = SaleorCalculateTaxesEvent.createFromGraphQL(payload)._unsafeUnwrap();

      expect(event.getDiscountAmount()).toBe(0);
    });

    it("should return discount amount if there is discount", () => {
      const payload = SaleorCalculateTaxesEventMockFactory.getGraphqlPayload();
      const eventWithDiscount = SaleorCalculateTaxesEvent.createFromGraphQL({
        ...payload,
        taxBase: {
          ...payload.taxBase,
          discounts: [
            {
              amount: {
                amount: 10,
              },
            },
          ],
        },
      });

      expect(eventWithDiscount._unsafeUnwrap().getDiscountAmount()).toBe(10);
    });
  });

  describe("getIsDiscounted method", () => {
    it("should return false if there are no discounts", () => {
      const payload = SaleorCalculateTaxesEventMockFactory.getGraphqlPayload();
      const event = SaleorCalculateTaxesEvent.createFromGraphQL(payload)._unsafeUnwrap();

      expect(event.getIsDiscounted()).toBe(false);
    });

    it("should return true if there is discount", () => {
      const payload = SaleorCalculateTaxesEventMockFactory.getGraphqlPayload();
      const eventWithDiscount = SaleorCalculateTaxesEvent.createFromGraphQL({
        ...payload,
        taxBase: {
          ...payload.taxBase,
          discounts: [
            {
              amount: {
                amount: 10,
              },
            },
          ],
        },
      });

      expect(eventWithDiscount._unsafeUnwrap().getIsDiscounted()).toBe(true);
    });
  });
});
