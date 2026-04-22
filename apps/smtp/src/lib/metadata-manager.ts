import { type SettingsManager } from "@saleor/app-sdk/settings-manager";
import { EncryptedMetadataManagerFactory } from "@saleor/apps-shared/metadata-manager";
import {
  resolveDecryptFallbacks,
  resolveEncryptKey,
} from "@saleor/apps-shared/secret-key-resolution";
import { type Client } from "urql";

import { env } from "../env";
import { createLogger } from "../logger";

const logger = createLogger("MetadataManager");

export const createSettingsManager = (client: Client, appId: string): SettingsManager => {
  const metadataManagerFactory = new EncryptedMetadataManagerFactory(
    resolveEncryptKey(env),
    resolveDecryptFallbacks(env),
    logger,
  );

  return metadataManagerFactory.create(client, appId);
};
