import { describe, expect, it } from "vitest";

import {
  getSaleorOrderStripeDescription,
  getSaleorOrderStripeMetadata,
} from "./saleor-order-stripe-metadata";

describe("getSaleorOrderStripeMetadata", () => {
  it("Skips order number when it's not sent by outdated webhook subscription query", () => {
    expect(
      getSaleorOrderStripeMetadata({ order: { id: "order-id" }, checkout: null }),
    ).toStrictEqual({ saleor_order_id: "order-id" });
    expect(getSaleorOrderStripeDescription({})).toBeUndefined();
  });
});
