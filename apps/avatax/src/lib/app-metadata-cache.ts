import { AsyncLocalStorage } from "async_hooks";
import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { MetadataItem } from "../../generated/graphql";
import { createLogger } from "../logger";
import { NextRequest, NextResponse } from "next/server";

/**
 * Set global context that stores metadata from webhook payload.
 * Use it as a temporary storage that provides access to metadata in the request scope
 */
export class AppMetadataCache {
  private als = new AsyncLocalStorage<{ metadata: MetadataItem[] | null }>();
  private logger = createLogger("AppMetadataCache");

  getRawMetadata(): MetadataItem[] | null {
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

  setMetadata(metadata: MetadataItem[]) {
    const store = this.als.getStore();

    if (!store) {
      throw new Error("Cant set metadata to AppMetadataCache. Function must be wrapped");
    }

    store.metadata = metadata;
  }
}

export const wrapWithMetadataCache = (cache: AppMetadataCache) => (handler: any) => {
  return (req: any, res: any) => {
    return cache.wrap(() => {
      return handler(req, res);
    });
  };
};

export const metadataCache = new AppMetadataCache();
