import { WebApiHandler } from "@saleor/app-sdk/handlers/fetch-api";
import { LoggerContext, wrapWithLoggerContext } from "@saleor/apps-logger/node";
import { NextApiHandler } from "next";

/**
 * Server-side only
 */
export const loggerContext = new LoggerContext();

export const withLoggerContext = (handler: NextApiHandler) => {
  return wrapWithLoggerContext(handler, loggerContext);
};

export const withLoggerContextAppRouter = (handler: WebApiHandler) => {
  return (req: Request) => {
    return loggerContext.wrap(() => {
      const saleorApiUrl = req.headers.get("saleor-api-url");
      const saleorEvent = req.headers.get("saleor-event");
      const path = req.url;

      loggerContext.set("path", path);
      loggerContext.set("saleorApiUrl", saleorApiUrl ?? null);
      loggerContext.set("saleorEvent", saleorEvent ?? null);
      return handler(req);
    });
  };
};
