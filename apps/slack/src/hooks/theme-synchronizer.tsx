import { useAppBridge } from "@saleor/app-sdk/app-bridge";
import { useTheme } from "@saleor/macaw-ui";
import { memo, useEffect } from "react";

function _ThemeSynchronizer() {
  const { appBridgeState } = useAppBridge();
  const { setTheme, themeType } = useTheme();

  useEffect(() => {
    if (!setTheme || !appBridgeState?.theme) {
      return;
    }

    if (themeType !== appBridgeState?.theme) {
      setTheme(appBridgeState.theme);
    }
  }, [appBridgeState?.theme, setTheme, themeType]);

  return null;
}

export const ThemeSynchronizer = memo(_ThemeSynchronizer);
