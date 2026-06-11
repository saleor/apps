import packageJson from "../../../package.json";
import { attachLoggerConsoleTransport } from "./logger-console-transport";
import { createLogger, logger } from "./logger";
import { attachLoggerSentryTransport } from "./logger-sentry-transport";
import { attachLoggerVercelRuntimeTransport } from "@/lib/logger/logger-vercel-transport";
import { loggerContext } from "@/logger-context";

logger.settings.maskValuesOfKeys = ["metadata", "username", "password", "apiKey"];

if (process.env.NODE_ENV !== "production") {
  attachLoggerConsoleTransport(logger);
}

if (typeof window === "undefined") {
  attachLoggerSentryTransport(logger);

  if (process.env.NODE_ENV === "production") {
    attachLoggerVercelRuntimeTransport(logger, packageJson.version, loggerContext);
  }
}

export { createLogger, logger };
