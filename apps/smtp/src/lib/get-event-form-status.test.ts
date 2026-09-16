import { describe, expect, it } from "vitest";

import { getEventFormStatus } from "./get-event-form-status";

describe("getEventFormStatus", function () {
  it("No message or disable flag, when event other than GIFT_CARD_SENT is passed", () => {
    expect(
      getEventFormStatus({
        eventType: "ORDER_CREATED",
        appPermissions: ["MANAGE_GIFT_CARD"],
      }),
    ).toStrictEqual({
      isDisabled: false,
      missingPermission: undefined,
    });
    expect(
      getEventFormStatus({
        eventType: "ORDER_CREATED",
        appPermissions: [],
      }),
    ).toStrictEqual({
      isDisabled: false,
      missingPermission: undefined,
    });
  });

  it("Return disable flag and lack of the permission message, when GIFT_CARD_SENT is passed and app has no manage gift card permission", () => {
    expect(
      getEventFormStatus({
        eventType: "GIFT_CARD_SENT",
        appPermissions: [],
      }),
    ).toStrictEqual({
      isDisabled: true,
      missingPermission: "MANAGE_GIFT_CARD",
    });
  });

  it("Return disable flag and lack of the permission message, when ORDER_REFUNDED is passed and app has no manage orders permission", () => {
    expect(
      getEventFormStatus({
        eventType: "ORDER_REFUNDED",
        appPermissions: [],
      }),
    ).toStrictEqual({
      isDisabled: true,
      missingPermission: "MANAGE_ORDERS",
    });
  });
});
