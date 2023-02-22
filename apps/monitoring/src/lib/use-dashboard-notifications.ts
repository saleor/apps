import { actions, useAppBridge } from "@saleor/app-sdk/app-bridge";

export const useDashboardNotifications = () => {
  const { appBridge } = useAppBridge();

  const showSuccessNotification = (title: string, text: string) => {
    appBridge?.dispatch(
      actions.Notification({
        title: title,
        text: text,
        status: "success",
      })
    );
  };

  const showErrorNotification = (title: string, text: string) => {
    appBridge?.dispatch(
      actions.Notification({
        title: title,
        text: text,
        status: "error",
      })
    );
  };

  return {
    showSuccessNotification,
    showErrorNotification,
  };
};
