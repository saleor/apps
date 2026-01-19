import { attachLoggerConsoleTransport, rootLogger } from "@saleor/apps-logger";

import packageJson from "../../package.json";

rootLogger.settings.maskValuesOfKeys = ["token", "secretKey"];

if (process.env.NODE_ENV !== "production") {
  attachLoggerConsoleTransport(rootLogger);
}

const asyncLoadAndAttachTransports = async () => {
  const transports = await import("@saleor/apps-logger/node");

  transports.attachLoggerSentryTransport(rootLogger);

  if (process.env.NODE_ENV === "production") {
    transports.attachLoggerVercelRuntimeTransport(
      rootLogger,
      packageJson.version,
      require("./logger-context").loggerContext,
    );
  }
};

if (typeof window === "undefined") {
  /**
   * Async loading, because mix-up of migration script, node, and client execution breaks module resolution
   */
  asyncLoadAndAttachTransports();
}

export const createLogger = (name: string, params?: Record<string, unknown>) =>
  rootLogger.getSubLogger(
    {
      name: name,
    },
    params,
  );
