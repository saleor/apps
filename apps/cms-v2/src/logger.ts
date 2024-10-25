import { attachLoggerConsoleTransport, rootLogger } from "@saleor/apps-logger";

import packageJson from "../package.json";

rootLogger.settings.maskValuesOfKeys = ["metadata", "username", "password", "apiKey"];

if (process.env.NODE_ENV !== "production") {
  attachLoggerConsoleTransport(rootLogger);
}

if (typeof window === "undefined") {
  import("@saleor/apps-logger/node").then(
    async ({ attachLoggerOtelTransport, attachLoggerSentryTransport, LoggerContext }) => {
      const loggerContext = await import("./logger-context").then((m) => m.loggerContext);

      attachLoggerSentryTransport(rootLogger);
      attachLoggerOtelTransport(rootLogger, packageJson.version, loggerContext);
    },
  );
}

export const createLogger = (name: string, params?: Record<string, unknown>) =>
  rootLogger.getSubLogger(
    {
      name: name,
    },
    params,
  );
