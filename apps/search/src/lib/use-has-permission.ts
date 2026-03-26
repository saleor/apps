import { useAppBridge } from "@saleor/app-sdk/app-bridge";
import { type Permission } from "@saleor/app-sdk/types";

export const useHasPermission = (permission: Permission): boolean => {
  const { appBridgeState } = useAppBridge();

  return appBridgeState?.user?.permissions.includes(permission) ?? false;
};
