// eslint-disable-next-line no-restricted-imports
import { attachLoggerConsoleTransport, rootLogger } from "@saleor/apps-logger";
import { attachLoggerOtelTransport } from "@saleor/apps-logger/node";

import packageJson from "../package.json";
import { loggerContext } from "../src/logger-context";

rootLogger.settings.maskValuesOfKeys = ["username", "password", "token"];

if (process.env.ENABLE_MIGRATION_CONSOLE_LOGGER === "true") {
  attachLoggerConsoleTransport(rootLogger);
}

attachLoggerOtelTransport(rootLogger, packageJson.version, loggerContext);

export const createMigrationScriptLogger = (name: string, params?: Record<string, unknown>) =>
  rootLogger.getSubLogger(
    {
      name: name,
    },
    params,
  );
