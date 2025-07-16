import { useAppBridge } from "@saleor/app-sdk/app-bridge";
import { Permission } from "@saleor/app-sdk/types";

export const useHasAppAccess = (
  requiredPermissions: Permission[],
): {
  haveAccessToApp: boolean;
} => {
  const { appBridgeState } = useAppBridge();

  if (!appBridgeState) {
    return {
      haveAccessToApp: false,
    };
  }

  const haveAccessToApp = requiredPermissions.every(
    (permission) => appBridgeState.user?.permissions.includes(permission),
  );

  return {
    haveAccessToApp,
  };
};
