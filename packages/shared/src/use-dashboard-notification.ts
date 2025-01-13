import { actions, useAppBridge } from "@saleor/app-sdk/app-bridge";
import { useCallback } from "react";

export const useDashboardNotification = () => {
  const { appBridge } = useAppBridge();

  return {
    notifySuccess: useCallback(
      (title: string, text?: string) => {
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
    notifyError: useCallback(
      (title: string, text?: string, apiMessage?: string) => {
        appBridge?.dispatch(
          actions.Notification({
            status: "error",
            title,
            text,
            apiMessage: apiMessage,
          })
        );
      },
      [appBridge]
    ),
    notifyWarning: useCallback(
      (title: string, text?: string) => {
        appBridge?.dispatch(
          actions.Notification({
            status: "warning",
            title,
            text,
          })
        );
      },
      [appBridge]
    ),
    notifyInfo: useCallback(
      (title: string, text?: string) => {
        appBridge?.dispatch(
          actions.Notification({
            status: "info",
            title,
            text,
          })
        );
      },
      [appBridge]
    ),
  };
};
