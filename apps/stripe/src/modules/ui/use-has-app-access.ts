import { useAppBridge } from "@saleor/app-sdk/app-bridge";

import { REQUIRED_CLIENT_PERMISSIONS } from "@/lib/required-client-permissions";

export const useHasAppAccess = (): {
  haveAccessToApp: boolean;
} => {
  const { appBridgeState } = useAppBridge();

  if (!appBridgeState) {
    return {
      haveAccessToApp: false,
    };
  }

  const haveAccessToApp = REQUIRED_CLIENT_PERMISSIONS.every(
    (permission) => appBridgeState.user?.permissions.includes(permission),
  );

  return {
    haveAccessToApp,
  };
};
