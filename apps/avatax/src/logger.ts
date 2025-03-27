import { rootLogger } from "@saleor/apps-logger/src/root-logger";
import { createRequire } from "module";

import packageJson from "../package.json";
import { env } from "./env";

rootLogger.settings.maskValuesOfKeys = ["metadata", "username", "password", "apiKey"];

const require = createRequire(import.meta.url);

if (env.NODE_ENV !== "production") {
  const { attachLoggerConsoleTransport } = await import(
    "@saleor/apps-logger/src/logger-console-transport"
  );

  attachLoggerConsoleTransport(rootLogger);
}

if (typeof window === "undefined") {
  const { attachLoggerVercelRuntimeTransport } = await import(
    "@saleor/apps-logger/src/logger-vercel-runtime-transport"
  );
  const { attachLoggerSentryTransport } = await import(
    "@saleor/apps-logger/src/logger-sentry-transport"
  );

  attachLoggerSentryTransport(rootLogger);

  if (env.NODE_ENV === "production") {
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
