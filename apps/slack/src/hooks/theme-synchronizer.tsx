import { useAppBridge } from "@saleor/app-sdk/app-bridge";
import { useTheme } from "@saleor/macaw-ui";
import { memo, useEffect } from "react";

/**
 * Macaw-ui stores its theme mode in memory and local storage. To synchronize App with Dashboard,
 * Macaw must be informed about this change from AppBridge.
 *
 * If you are not using Macaw, you can remove this.
 */
function _ThemeSynchronizer() {
  const { appBridgeState, appBridge } = useAppBridge();
  const { setTheme, themeType } = useTheme();

  /*
   * todo - replace this hook to appBridge.subscribe and react only only on initial theme event
   * useEffect(() =>{
   *   appBridge?.subscribe('theme',console.log)
   * },[appBridge])
   */

  useEffect(() => {
    if (!setTheme || !appBridgeState?.theme) {
      return;
    }

    if (themeType !== appBridgeState?.theme) {
      setTheme(appBridgeState.theme);
      /**
       * Hack to fix macaw, which is going into infinite loop on light mode (probably de-sync local storage with react state)
       * TODO Fix me when Macaw 2.0 is shipped
       */
      window.localStorage.setItem("macaw-ui-theme", appBridgeState.theme);
    }
  }, [appBridgeState?.theme, setTheme, themeType]);

  return null;
}

export const ThemeSynchronizer = memo(_ThemeSynchronizer);
