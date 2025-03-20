import { attachLoggerConsoleTransport, rootLogger } from "@saleor/apps-logger";

import packageJson from "../../package.json";

rootLogger.settings.maskValuesOfKeys = ["token", "secretKey"];

if (process.env.NODE_ENV !== "production") {
  attachLoggerConsoleTransport(rootLogger);
}

if (typeof window === "undefined") {
  // Don't remove require - it's necessary for proper logger initialization
  const {
    attachLoggerSentryTransport,
    attachLoggerVercelRuntimeTransport,
  } = require("@saleor/apps-logger/node");

  attachLoggerSentryTransport(rootLogger);

  if (process.env.NODE_ENV === "production") {
    attachLoggerVercelRuntimeTransport(
      rootLogger,
      packageJson.version,
      require("./logger-context").loggerContext,
    );
  }
}

export const createLogger = (name: string, params?: Record<string, unknown>) =>
  rootLogger.getSubLogger(
    {
      name: name,
    },
    params,
  );
