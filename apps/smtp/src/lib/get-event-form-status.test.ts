import { describe, expect, it } from "vitest";
import { getEventFormStatus } from "./get-event-form-status";
import { PermissionEnum } from "../../generated/graphql";

describe("getEventFormStatus", function () {
  it("No message or disable flag, when event other than GIFT_CARD_SENT is passed", () => {
    expect(
      getEventFormStatus({
        eventType: "ORDER_CREATED",
        appPermissions: [PermissionEnum.ManageGiftCard],
        featureFlags: {
          giftCardSentEvent: true,
          orderRefundedEvent: true,
        },
      }),
    ).toEqual({
      tooltipMessage: undefined,
      isDisabled: false,
    });
    expect(
      getEventFormStatus({
        eventType: "ORDER_CREATED",
        appPermissions: [],
        featureFlags: {
          giftCardSentEvent: false,
          orderRefundedEvent: true,
        },
      }),
    ).toEqual({
      isDisabled: false,
      missingPermission: undefined,
      requiredSaleorVersion: undefined,
    });
  });

  it("Return disable flag and lack of the permission message, when GIFT_CARD_SENT is passed and app has no manage gift card permission", () => {
    expect(
      getEventFormStatus({
        eventType: "GIFT_CARD_SENT",
        appPermissions: [],
        featureFlags: {
          giftCardSentEvent: true,
          orderRefundedEvent: true,
        },
      }),
    ).toEqual({
      isDisabled: true,
      missingPermission: PermissionEnum.ManageGiftCard,
      requiredSaleorVersion: undefined,
    });
  });

  it("Return disable flag and unsupported Saleor version message, when GIFT_CARD_SENT is passed with missing feature flag", () => {
    expect(
      getEventFormStatus({
        eventType: "GIFT_CARD_SENT",
        appPermissions: [PermissionEnum.ManageGiftCard],
        featureFlags: {
          giftCardSentEvent: false,
          orderRefundedEvent: true,
        },
      }),
    ).toEqual({
      isDisabled: true,
      missingPermission: undefined,
      requiredSaleorVersion: ">=3.13",
    });
  });
});
