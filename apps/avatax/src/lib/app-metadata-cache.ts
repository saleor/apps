import { AsyncLocalStorage } from "async_hooks";
import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { SALEOR_API_URL_HEADER, SALEOR_EVENT_HEADER } from "@saleor/app-sdk/const";

/**
 * Set global context that stores metadata from webhook payload.
 * Use it as a temporary storage that provides access to metadata in the request scope
 */
export class AppMetadataCache {
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

export const wrapWithMetadataCache = (cache: AppMetadataCache) => (handler: NextApiHandler) => {
  return (req: NextApiRequest, res: NextApiResponse) => {
    return cache.wrap(() => {
      return handler(req, res);
    });
  };
};

export const metadataCache = new AppMetadataCache();
