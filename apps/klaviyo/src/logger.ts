import { attachLoggerConsoleTransport, rootLogger } from "@saleor/apps-logger";

import packageJson from "../package.json";
import { env } from "./env";

rootLogger.settings.maskValuesOfKeys = ["metadata", "username", "password", "apiKey"];

if (env.NODE_ENV !== "production") {
  attachLoggerConsoleTransport(rootLogger);
}

if (typeof window === "undefined") {
  const { attachLoggerSentryTransport, attachLoggerVercelRuntimeTransport } = await import(
    "@saleor/apps-logger/node"
  );

  attachLoggerSentryTransport(rootLogger);

  if (env.NODE_ENV === "production") {
    const { loggerContext } = await import("./logger-context");

    attachLoggerVercelRuntimeTransport(rootLogger, packageJson.version, loggerContext);
  }
}

export const createLogger = (name: string, params?: Record<string, unknown>) =>
  rootLogger.getSubLogger(
    {
      name: name,
    },
    params,
  );
