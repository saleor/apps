import { createLogger } from "@saleor/apps-shared";
import { CacheConfigurator } from "./cache-configurator";
import { createSettingsManager } from "../../lib/metadata-manager";
import { getCursors } from "../../lib/google-feed/fetch-product-data";
import { Client } from "urql";
import { z } from "zod";
import { appConfigInputSchema } from "../app-configuration/app-config-input-schema";

interface UpdateCacheForConfigurationsArgs {
  client: Client;
  saleorApiUrl: string;
  configurations: z.infer<typeof appConfigInputSchema>;
}

export const updateCacheForConfigurations = async ({
  client,
  configurations,
  saleorApiUrl,
}: UpdateCacheForConfigurationsArgs) => {
  const logger = createLogger({ saleorApiUrl: saleorApiUrl });

  logger.debug("Updating the cursor cache");
  const cache = new CacheConfigurator(createSettingsManager(client), saleorApiUrl);

  const channelsToUpdate = Object.keys(configurations.shopConfigPerChannel);

  const cacheUpdatePromises = channelsToUpdate.map(async (channel) => {
    const cursors = await getCursors({ client, channel });

    await cache.set({ channel, value: cursors });
  });

  await Promise.all(cacheUpdatePromises);
  logger.debug("Cursor cache updated");
};
