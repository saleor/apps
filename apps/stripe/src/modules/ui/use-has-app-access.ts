import { useAppBridge } from "@saleor/app-sdk/app-bridge";

import { REQUIRED_CLIENT_PERMISSIONS } from "@/lib/required-client-permissions";

export const useHasAppAccess = (): {
  haveAccessToApp: boolean;
  /**
   * Dashboard only sends `user` once the AppBridge handshake completes, which a reload or a
   * deep link races. Until then permissions are unknown — treating that as a denial would tell
   * users they lack access they actually have.
   */
  isReady: boolean;
} => {
  const { appBridgeState } = useAppBridge();
  const user = appBridgeState?.user;

  if (!user) {
    return {
      haveAccessToApp: false,
      isReady: false,
    };
  }

  const haveAccessToApp = REQUIRED_CLIENT_PERMISSIONS.every((permission) =>
    user.permissions.includes(permission),
  );

  return {
    haveAccessToApp,
    isReady: true,
  };
};
