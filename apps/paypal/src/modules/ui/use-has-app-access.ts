import { useAppBridge } from "@saleor/app-sdk/app-bridge";

import { requiredClientPermissions } from "@/lib/required-client-permissions";

export const useHasAppAccess = (): {
  haveAccessToApp: boolean;
} => {
  const { appBridgeState } = useAppBridge();

  if (!appBridgeState) {
    return {
      haveAccessToApp: false,
    };
  }

  const haveAccessToApp = requiredClientPermissions.every(
    (permission) => appBridgeState.user?.permissions.includes(permission),
  );

  return {
    haveAccessToApp,
  };
};
