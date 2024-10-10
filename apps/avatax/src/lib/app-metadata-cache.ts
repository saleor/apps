import { AsyncLocalStorage } from "async_hooks";
import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";

import { MetadataItemFragmentType } from "../../graphql/fragments/MetadataItem";
import { createLogger } from "../logger";

/**
 * Set global context that stores metadata from webhook payload.
 * Use it as a temporary storage that provides access to metadata in the request scope
 */
export class AppMetadataCache {
  private als = new AsyncLocalStorage<{ metadata: MetadataItemFragmentType[] | null }>();
  private logger = createLogger("AppMetadataCache");

  getRawMetadata(): MetadataItemFragmentType[] | null {
    const store = this.als.getStore();

    if (!store) {
      this.logger.debug(
        "You cant use AppMetadataCache store outside of the wrapped scope. Will fallback to null",
      );

      return null;
    }

    return store.metadata;
  }

  async wrap(fn: (...args: unknown[]) => unknown) {
    return this.als.run({ metadata: null }, fn);
  }

  setMetadata(metadata: MetadataItemFragmentType[]) {
    const store = this.als.getStore();

    if (!store) {
      throw new Error("Cant set metadata to AppMetadataCache. Function must be wrapped");
    }

    store.metadata = metadata;
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
