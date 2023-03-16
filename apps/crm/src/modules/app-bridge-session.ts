import { AppBridge, AppBridgeState, useAppBridge } from "@saleor/app-sdk/app-bridge";
import { invariant } from "graphql/jsutils/invariant";
import { useEffect } from "react";
import { createLogger } from "../lib/logger";

const logger = createLogger({ context: "AppBridgeSession" });

export class AppBridgeSession {
  private sessionKey = "saleor-app-crm-app-bridge-session";

  constructor() {
    invariant(
      window.localStorage,
      "window.localStorage not found, ensure AppBridgeSession is used in browser"
    );
  }

  saveSession(appBridge: AppBridge) {
    window.localStorage.setItem(this.sessionKey, JSON.stringify(appBridge.getState()));
  }

  constructAppBridgeFromSession(): AppBridge {
    try {
      const sessionParsed = JSON.parse(
        window.localStorage.getItem(this.sessionKey)!
      ) as AppBridgeState;

      return new AppBridge({
        autoNotifyReady: true,
        saleorApiUrl: sessionParsed.saleorApiUrl,
        initialTheme: sessionParsed.theme,
        targetDomain: sessionParsed.domain,
        initialLocale: sessionParsed.locale,
      });
    } catch (e) {
      throw new Error("cant find AppBridge stored in session");
    }
  }
}

export const AppBridgeSessionSaver = () => {
  const { appBridge } = useAppBridge();

  useEffect(() => {
    if (appBridge?.getState().ready) {
      logger.debug("Will save AppBridge in local storage");

      new AppBridgeSession().saveSession(appBridge);
    }
  }, [appBridge]);

  return null;
};
