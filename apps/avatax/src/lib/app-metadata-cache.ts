import { AsyncLocalStorage } from "async_hooks";
import { MetadataItem } from "../../generated/graphql";
import { createLogger } from "../logger";
import { NextRequest, NextResponse } from "next/server";
import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";

type Handler = (req: NextRequest) => Promise<NextResponse>;

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

  async wrap(fn: any) {
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

export const wrapWithMetadataCache = (cache: AppMetadataCache) => (handler: NextApiHandler) => {
  return (req: NextApiRequest, res: NextApiResponse) => {
    return cache.wrap(() => {
      return handler(req, res);
    });
  };
};

export const wrapWithMetadataCacheAppRouter =
  (cache: AppMetadataCache) => (handler: Handler) => (req: NextRequest) =>
    cache.wrap(() => handler(req));

export const metadataCache = new AppMetadataCache();
