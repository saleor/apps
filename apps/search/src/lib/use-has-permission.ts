import { useAppBridge } from "@saleor/app-sdk/app-bridge";
import { type AppPermission } from "@saleor/app-sdk/types";

export const useHasPermission = (permission: AppPermission): boolean => {
  const { appBridgeState } = useAppBridge();

  return appBridgeState?.appPermissions?.includes(permission) ?? false;
};
