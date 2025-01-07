import { describe, expect, it, vi } from "vitest";

import { mockedOrderBase } from "./__tests__/mocks";
import { trackingEventFactory } from "./tracking-events";

describe("trackingEventFactory", () => {
  it("should create event for order created with anonymous user if user data in not present", () => {
    vi.mock("uuid", () => ({ v4: () => "2137" }));

    const event = trackingEventFactory.createOrderCreatedEvent({
      orderBase: { ...mockedOrderBase, userEmail: undefined },
      issuedAt: "2025-01-07",
    });

    expect(event).toMatchInlineSnapshot(`
      {
        "issuedAt": "2025-01-07",
        "payload": {
          "channel": {
            "id": "channel-id",
            "name": "channel-name",
            "slug": "channel-slug",
          },
          "id": "order-id",
          "lines": [],
          "number": "order-number",
          "total": {
            "gross": {
              "amount": 37,
              "currency": "USD",
            },
            "net": {
              "amount": 21,
              "currency": "USD",
            },
          },
        },
        "type": "Saleor Order Created",
        "user": {
          "id": "2137",
          "type": "anonymous",
        },
      }
    `);
  });

  it("should create event for order created with user email if user information is present", () => {
    const event = trackingEventFactory.createOrderCreatedEvent({
      orderBase: mockedOrderBase,
      issuedAt: "2025-01-07",
    });

    expect(event).toMatchInlineSnapshot(`
      {
        "issuedAt": "2025-01-07",
        "payload": {
          "channel": {
            "id": "channel-id",
            "name": "channel-name",
            "slug": "channel-slug",
          },
          "id": "order-id",
          "lines": [],
          "number": "order-number",
          "total": {
            "gross": {
              "amount": 37,
              "currency": "USD",
            },
            "net": {
              "amount": 21,
              "currency": "USD",
            },
          },
        },
        "type": "Saleor Order Created",
        "user": {
          "id": "user-email",
          "type": "logged",
        },
      }
    `);
  });
});
