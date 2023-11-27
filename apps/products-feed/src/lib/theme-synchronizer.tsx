import { useAppBridge } from "@saleor/app-sdk/app-bridge";
import { useTheme } from "@saleor/macaw-ui";
import { useEffect } from "react";

// todo move to shared
export function ThemeSynchronizer() {
  const { appBridgeState } = useAppBridge();
  const { setTheme } = useTheme();

  useEffect(() => {
    if (!setTheme || !appBridgeState?.theme) {
      return;
    }

    if (appBridgeState.theme === "light") {
      setTheme("defaultLight");
    }

    if (appBridgeState.theme === "dark") {
      setTheme("defaultDark");
    }
  }, [appBridgeState?.theme, setTheme]);

  return null;
}
