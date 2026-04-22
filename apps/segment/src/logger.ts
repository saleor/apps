import { attachLoggerConsoleTransport, rootLogger } from "@saleor/apps-logger";

import packageJson from "../package.json";
import { env } from "./env";

rootLogger.settings.maskValuesOfKeys = ["metadata", "username", "password", "apiKey"];

if (env.NODE_ENV === "development") {
  attachLoggerConsoleTransport(rootLogger);
}

if (typeof window === "undefined" && env.NODE_ENV === "production") {
  const { attachLoggerVercelRuntimeTransport } = await import("@saleor/apps-logger/node");
  const { loggerContext } = await import("./logger-context");

  attachLoggerVercelRuntimeTransport(rootLogger, packageJson.version, loggerContext);
}

export const createLogger = (name: string, params?: Record<string, unknown>) =>
  rootLogger.getSubLogger(
    {
      name: name,
    },
    params,
  );
