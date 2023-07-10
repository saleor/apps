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
  // Since GIFT_CARD_SENT is the only event with such validation, we can exit early
  if (eventType !== "GIFT_CARD_SENT") {
    return {
      isDisabled: false,
      missingPermission: undefined,
      requiredSaleorVersion: undefined,
    };
  }

  const isUnsupported = !featureFlags?.giftCardSentEvent;

  const hasGiftCardPermission = (appPermissions || []).includes(PermissionEnum.ManageGiftCard);

  const isDisabled = isUnsupported || !hasGiftCardPermission;

  return {
    isDisabled,
    missingPermission: hasGiftCardPermission ? undefined : PermissionEnum.ManageGiftCard,
    requiredSaleorVersion: isUnsupported ? ">=3.13" : undefined,
  };
};
