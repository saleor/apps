import { createLogger } from "@saleor/apps-shared";
import { CacheConfigurator } from "./cache-configurator";
import { createSettingsManager } from "../../lib/metadata-manager";
import { getCursors } from "../google-feed/fetch-product-data";
import { Client } from "urql";

interface UpdateCacheForConfigurationsArgs {
  client: Client;
  saleorApiUrl: string;
  channelsSlugs: string[];
}

export const updateCacheForConfigurations = async ({
  client,
  channelsSlugs,
  saleorApiUrl,
}: UpdateCacheForConfigurationsArgs) => {
  const logger = createLogger({ saleorApiUrl: saleorApiUrl });

  logger.debug("Updating the cursor cache");

  const cache = new CacheConfigurator(createSettingsManager(client), saleorApiUrl);

  const cacheUpdatePromises = channelsSlugs.map(async (channel) => {
    const cursors = await getCursors({ client, channel });

    await cache.set({ channel, value: cursors });
  });

  await Promise.all(cacheUpdatePromises);

  logger.debug("Cursor cache updated");
};
