// eslint-disable-next-line no-restricted-imports
import { attachLoggerConsoleTransport, rootLogger } from "@saleor/apps-logger";

import packageJson from "../../package.json";

rootLogger.settings.maskValuesOfKeys = ["token", "secretKey"];

if (process.env.NODE_ENV !== "production") {
  attachLoggerConsoleTransport(rootLogger);
}

if (typeof window === "undefined") {
  import("@saleor/apps-logger/node").then(
    ({ attachLoggerOtelTransport, attachLoggerSentryTransport }) => {
      attachLoggerSentryTransport(rootLogger);
      attachLoggerOtelTransport(rootLogger, packageJson.version);
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
