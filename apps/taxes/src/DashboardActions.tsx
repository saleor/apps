import { useAppBridge } from "@saleor/app-sdk/app-bridge";
import { Button } from "@saleor/macaw-ui";

/**
 * This is example of using AppBridge, when App is mounted in Dashboard
 * See more about AppBridge possibilities
 * https://github.com/saleor/saleor-app-sdk/blob/main/docs/app-bridge.md
 *
 * You can safely remove this file!
 */
export const DashboardActions = () => {
  const { appBridge } = useAppBridge();

  return (
    <div>
      <h2>App running in dashboard!</h2>
      <div style={{
        display:'inline-grid',
        gridGap: '2rem',
        gridTemplateColumns:'50% 50%'
      }}>
        <Button
          onClick={() => {
            appBridge?.dispatch({
              type: "notification",
              payload: {
                status: "success",
                title: "You rock!",
                text: "This notification was triggered from Saleor App",
                actionId: "message-from-app",
              },
            });
          }}
        >
          Trigger notification 📤
        </Button>
        <Button
          onClick={() => {
            appBridge?.dispatch({
              type: "redirect",
              payload: {
                to: "/orders",
                actionId: "message-from-app",
              },
            });
          }}
        >
          Redirect to orders ➡️💰
        </Button>
      </div>
    </div>
  );
};

/**
 * Export default for Next.dynamic
 */
export default DashboardActions;
