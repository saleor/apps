import { useAppBridge } from "@saleor/app-sdk/app-bridge";
import { useEffect, useState } from "react";
import * as jose from "jose";

/**
 * use app-sdk
 */
export function useAuthorizedToken(requirePermission: string) {
  const [authorized, setAuthorized] = useState<boolean | undefined>();

  const { appBridgeState } = useAppBridge();

  useEffect(() => {
    if (appBridgeState?.token) {
      const decodedToken = jose.decodeJwt(appBridgeState.token);

      try {
        const userPermissions = decodedToken.user_permissions as string[];

        if (userPermissions.includes(requirePermission)) {
          setAuthorized(true);
        }
      } catch (e) {
        setAuthorized(false);
      }
    }
  }, [appBridgeState, requirePermission]);

  return authorized;
}
