import { NextAppRouterHandler } from "@saleor/app-sdk/handlers/next-app-router";
import {
  LoggerContext,
  wrapWithLoggerContextAppRouter,
} from "@saleor/apps-logger/src/logger-context";

/**
 * Server-side only
 */
export const loggerContext = new LoggerContext();

export const withLoggerContext = (handler: NextAppRouterHandler) => {
  return wrapWithLoggerContextAppRouter(handler, loggerContext);
};
