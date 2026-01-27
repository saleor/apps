import { attachLoggerConsoleTransport, rootLogger } from "@saleor/apps-logger";

import { env } from "../env";

rootLogger.settings.maskValuesOfKeys = ["token", "secretKey"];

if (env.NODE_ENV !== "production") {
  attachLoggerConsoleTransport(rootLogger);
}

if (typeof window === "undefined") {
  /**
   * Dynamic imports to prevent node-specific code from being bundled for the browser
   */
  Promise.all([
    import("@saleor/apps-logger/node"),
    import("../../package.json"),
    import("./logger-context"),
  ]).then(([transports, packageJson, loggerContextModule]) => {
    transports.attachLoggerSentryTransport(rootLogger);

    if (env.NODE_ENV === "production") {
      transports.attachLoggerVercelRuntimeTransport(
        rootLogger,
        packageJson.default.version,
        loggerContextModule.loggerContext,
      );
    }
  });
}

export const createLogger = (name: string, params?: Record<string, unknown>) =>
  rootLogger.getSubLogger(
    {
      name: name,
    },
    params,
  );
