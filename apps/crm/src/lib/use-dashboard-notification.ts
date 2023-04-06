import { useCallback } from "react";
import { actions, useAppBridge } from "@saleor/app-sdk/app-bridge";

export const useDashboardNotification = () => {
  const { appBridge } = useAppBridge();

  return {
    notifySuccess: useCallback(
      (title: string, text: string) => {
        appBridge?.dispatch(
          actions.Notification({
            status: "success",
            title,
            text,
          })
        );
      },
      [appBridge]
    ),
  };
};
