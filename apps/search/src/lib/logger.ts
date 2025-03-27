import { rootLogger } from "@saleor/apps-logger/src/root-logger";

import packageJson from "../../package.json";

rootLogger.settings.maskValuesOfKeys = ["metadata", "username", "password", "apiKey"];

if (process.env.NODE_ENV !== "production") {
  const { attachLoggerConsoleTransport } = await import(
    "@saleor/apps-logger/src/logger-console-transport"
  );

  attachLoggerConsoleTransport(rootLogger);
}

if (typeof window === "undefined") {
  const { attachLoggerSentryTransport } = await import(
    "@saleor/apps-logger/src/logger-sentry-transport"
  );

  attachLoggerSentryTransport(rootLogger);

  if (process.env.NODE_ENV === "production") {
    const { attachLoggerVercelRuntimeTransport } = await import(
      "@saleor/apps-logger/src/logger-vercel-runtime-transport"
    );

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
