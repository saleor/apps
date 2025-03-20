import { NextAppRouterHandler } from "@saleor/app-sdk/handlers/next-app-router";
import { SALEOR_API_URL_HEADER, SALEOR_EVENT_HEADER } from "@saleor/app-sdk/headers";
import { LoggerContext, wrapWithLoggerContext } from "@saleor/apps-logger/node";
import { NextApiHandler } from "next";
import { NextRequest } from "next/server";

/**
 * Server-side only
 */
export const loggerContext = new LoggerContext();

export const withLoggerContext = (handler: NextApiHandler) => {
  return wrapWithLoggerContext(handler, loggerContext);
};

export const withLoggerContextAppRouter = (handler: NextAppRouterHandler) => {
  return (req: NextRequest) => {
    return loggerContext.wrap(() => {
      const saleorApiUrl = req.headers.get(SALEOR_API_URL_HEADER);
      const saleorEvent = req.headers.get(SALEOR_EVENT_HEADER);
      const path = req.url as string;

      loggerContext.set("path", path);
      loggerContext.set("saleorApiUrl", saleorApiUrl ?? null);
      loggerContext.set("saleorEvent", saleorEvent ?? null);

      return handler(req);
    });
  };
};
