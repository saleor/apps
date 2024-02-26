import { AsyncLocalStorage } from "async_hooks";
import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { SALEOR_API_URL_HEADER, SALEOR_EVENT_HEADER } from "@saleor/app-sdk/const";

export class LoggerContext {
  private als = new AsyncLocalStorage<Record<string, unknown>>();

  getRawContext() {
    const store = this.als.getStore();

    if (!store) {
      console.debug("You cant use LoggerContext outside of the wrapped scope. Will fallback to {}");

      return {};
    }

    return store;
  }

  async wrap(fn: (...args: unknown[]) => unknown, initialState = {}) {
    return this.als.run(initialState, fn);
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

      loggerContext.set("saleorApiUrl", saleorApiUrl ?? null);
      loggerContext.set("saleorEvent", saleorEvent ?? null);

      return handler(req, res);
    });
  };
};
