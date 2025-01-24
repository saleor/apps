import { describe, expect, it, vi } from "vitest";

import { mockedOrderBase } from "./__tests__/mocks";
import { trackingEventFactory } from "./tracking-events";

describe("trackingEventFactory", () => {
  it("should create event for order updated with anonymous user if user data in not present", () => {
    vi.mock("uuid", () => ({ v4: () => "2137" }));

    const event = trackingEventFactory.createOrderUpdatedEvent({
      orderBase: { ...mockedOrderBase, userEmail: undefined },
      issuedAt: "2025-01-07",
    });

    expect(event).toMatchInlineSnapshot(`
      {
        "issuedAt": "2025-01-07",
        "payload": {
          "channel_id": "channel-id",
          "currency": "USD",
          "discount": 7,
          "order_id": "order-id",
          "products": [
            {
              "category": "categoryName",
              "name": "productName",
              "price": 37,
              "product_id": "line-id",
              "quantity": 1,
              "sku": "sku",
              "variant": "variantName",
            },
          ],
          "shipping": 5,
          "tax": 0.21,
          "total": 37,
        },
        "type": "Saleor Order Updated",
        "user": {
          "id": "2137",
          "type": "anonymous",
        },
      }
    `);
  });

  it("should create event for order updated with user email if user information is present", () => {
    const event = trackingEventFactory.createOrderUpdatedEvent({
      orderBase: mockedOrderBase,
      issuedAt: "2025-01-07",
    });

    expect(event).toMatchInlineSnapshot(`
      {
        "issuedAt": "2025-01-07",
        "payload": {
          "channel_id": "channel-id",
          "currency": "USD",
          "discount": 7,
          "order_id": "order-id",
          "products": [
            {
              "category": "categoryName",
              "name": "productName",
              "price": 37,
              "product_id": "line-id",
              "quantity": 1,
              "sku": "sku",
              "variant": "variantName",
            },
          ],
          "shipping": 5,
          "tax": 0.21,
          "total": 37,
        },
        "type": "Saleor Order Updated",
        "user": {
          "id": "user-email",
          "type": "logged",
        },
      }
    `);
  });

  it("should calculate total discount for order updated based of total & undiscountedTotal", () => {
    const event = trackingEventFactory.createOrderUpdatedEvent({
      orderBase: mockedOrderBase,
      issuedAt: "2025-01-07",
    });

    expect(event.payload.discount).toBe(
      mockedOrderBase.total.gross.amount - mockedOrderBase.undiscountedTotal.gross.amount,
    );
  });
});
