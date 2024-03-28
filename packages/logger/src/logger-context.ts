import { SALEOR_API_URL_HEADER, SALEOR_EVENT_HEADER } from "@saleor/app-sdk/const";
import { AsyncLocalStorage } from "async_hooks";
import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";

export class LoggerContext {
  private als = new AsyncLocalStorage<Record<string, unknown>>();
  private project_name = process.env.OTEL_SERVICE_NAME as string | undefined;

  getRawContext() {
    const store = this.als.getStore();

    if (!store) {
      if (!process.env.CI && process.env.OTEL_ENABLED === "true") {
        console.warn(
          "You cant use LoggerContext outside of the wrapped scope. Will fallback to {}",
        );
      }

      return {};
    }

    return store;
  }

  async wrap(fn: (...args: unknown[]) => unknown, initialState = {}) {
    return this.als.run(
      {
        ...initialState,
        project_name: this.project_name,
      },
      fn,
    );
  }

  set(key: string, value: string | number | Record<string, unknown> | null) {
    const store = this.getRawContext();

    store[key] = value;
  }
}

export const wrapWithLoggerContext = (handler: NextApiHandler, loggerContext: LoggerContext) => {
  return (req: NextApiRequest, res: NextApiResponse) => {
    return loggerContext.wrap(() => {
      const saleorApiUrl = req.headers[SALEOR_API_URL_HEADER] as string;
      const saleorEvent = req.headers[SALEOR_EVENT_HEADER] as string;
      const path = req.url as string;

      loggerContext.set("path", path);
      loggerContext.set("saleorApiUrl", saleorApiUrl ?? null);
      loggerContext.set("saleorEvent", saleorEvent ?? null);

      return handler(req, res);
    });
  };
};
