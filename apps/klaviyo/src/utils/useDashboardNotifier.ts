import { actions, NotificationPayload, useAppBridge } from "@saleor/app-sdk/app-bridge";

export const useDashboardNotifier = () => {
  const { appBridgeState, appBridge } = useAppBridge();

  const notify = (payload: NotificationPayload) =>
    appBridgeState?.ready && appBridge?.dispatch(actions.Notification(payload));

  return [notify];
};
