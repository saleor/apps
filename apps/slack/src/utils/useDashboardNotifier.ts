import { actions, NotificationPayload, useAppBridge } from "@saleor/app-sdk/app-bridge";

const useDashboardNotifier = () => {
  const { appBridge, appBridgeState } = useAppBridge();

  const notify = (payload: NotificationPayload) =>
    appBridgeState?.ready && appBridge?.dispatch(actions.Notification(payload));

  return [notify];
};

export default useDashboardNotifier;
