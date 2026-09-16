import { type PermissionEnum } from "../../generated/graphql";
import { type MessageEventTypes } from "../modules/event-handlers/message-event-types";

interface getEventFormStatusArgs {
  eventType: MessageEventTypes;
  appPermissions?: PermissionEnum[];
}

export const getEventFormStatus = ({
  eventType,
  appPermissions,
}: getEventFormStatusArgs): {
  missingPermission: PermissionEnum | undefined;
  isDisabled: boolean;
} => {
  switch (eventType) {
    case "ORDER_REFUNDED": {
      const hasPermission = (appPermissions || []).includes("MANAGE_ORDERS");

      return {
        isDisabled: !hasPermission,
        missingPermission: hasPermission ? undefined : "MANAGE_ORDERS",
      };
    }

    case "GIFT_CARD_SENT": {
      const hasPermission = (appPermissions || []).includes("MANAGE_GIFT_CARD");

      return {
        isDisabled: !hasPermission,
        missingPermission: hasPermission ? undefined : "MANAGE_GIFT_CARD",
      };
    }

    default:
      return {
        isDisabled: false,
        missingPermission: undefined,
      };
  }
};
