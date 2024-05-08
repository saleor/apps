import { PermissionEnum } from "../../generated/graphql";
import { MessageEventTypes } from "../modules/event-handlers/message-event-types";
import { FeatureFlagsState } from "../modules/feature-flag-service/get-feature-flags";

interface getEventFormStatusArgs {
  eventType: MessageEventTypes;
  featureFlags?: FeatureFlagsState;
  appPermissions?: PermissionEnum[];
}

export const getEventFormStatus = ({
  eventType,
  featureFlags,
  appPermissions,
}: getEventFormStatusArgs): {
  missingPermission: PermissionEnum | undefined;
  isDisabled: boolean;
  requiredSaleorVersion: string | undefined;
} => {
  switch (eventType) {
    case "ORDER_REFUNDED": {
      const isUnsupported = !featureFlags?.orderRefundedEvent;

      const hasPermission = (appPermissions || []).includes(PermissionEnum.ManageOrders);

      const isDisabled = isUnsupported || !hasPermission;

      return {
        isDisabled,
        missingPermission: hasPermission ? undefined : PermissionEnum.ManageOrders,
        requiredSaleorVersion: isUnsupported ? ">=3.14" : undefined,
      };
    }
    case "GIFT_CARD_SENT": {
      const isUnsupported = !featureFlags?.giftCardSentEvent;

      const hasPermission = (appPermissions || []).includes(PermissionEnum.ManageGiftCard);

      const isDisabled = isUnsupported || !hasPermission;

      return {
        isDisabled,
        missingPermission: hasPermission ? undefined : PermissionEnum.ManageGiftCard,
        requiredSaleorVersion: isUnsupported ? ">=3.13" : undefined,
      };
    }
    default:
      return {
        isDisabled: false,
        missingPermission: undefined,
        requiredSaleorVersion: undefined,
      };
  }
};
