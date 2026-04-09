import { type SettingsManager } from "@saleor/app-sdk/settings-manager";
import { collectFallbackSecretKeys } from "@saleor/apps-shared/fallback-secret-keys";
import { EncryptedMetadataManagerFactory } from "@saleor/apps-shared/metadata-manager";
import { type Client } from "urql";

import { env } from "@/env";
import { createLogger } from "@/logger";

const logger = createLogger("MetadataManager");

export const createSettingsManager = (
  client: Pick<Client, "query" | "mutation">,
  appId: string,
): SettingsManager => {
  const metadataManagerFactory = new EncryptedMetadataManagerFactory(
    env.SECRET_KEY,
    collectFallbackSecretKeys(env),
    logger
  );

  return metadataManagerFactory.create(client, appId);
};
