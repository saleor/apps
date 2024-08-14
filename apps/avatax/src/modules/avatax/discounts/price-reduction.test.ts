import { describe, expect, it } from "vitest";

import { SaleorOrderConfirmedEvent } from "@/modules/saleor";
import { SaleorOrderConfirmedEventMockFactory } from "@/modules/saleor/order-confirmed/mocks";

import { PriceReductionDiscountsStrategy } from "./price-reduction";

describe("PriceReductionDiscountsStrategy", () => {
  const strategy = new PriceReductionDiscountsStrategy();
  const payload = SaleorOrderConfirmedEventMockFactory.getGraphqlPayload();
  const orderConfirmedEvent = SaleorOrderConfirmedEvent.createFromGraphQL(payload)._unsafeUnwrap();

  describe("getDiscountAmount", () => {
    it("should return undefined - this is noop", () => {
      const totalDiscount = strategy.getDiscountAmount(orderConfirmedEvent);

      expect(totalDiscount).toBeUndefined();
    });
  });

  describe("areLinesDiscounted", () => {
    it("should return false - this is noop", () => {
      const areLinesDiscounted = strategy.areLinesDiscounted(orderConfirmedEvent);

      expect(areLinesDiscounted).toBeUndefined();
    });
  });
});
