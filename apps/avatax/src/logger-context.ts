import { LoggerContext, wrapWithLoggerContext } from "@saleor/apps-logger/node";
import { NextApiHandler } from "next";

/**
 * Server-side only
 */
export const loggerContext = new LoggerContext();

export const withLoggerContext = (handler: NextApiHandler) => {
  return wrapWithLoggerContext(handler, loggerContext);
};
