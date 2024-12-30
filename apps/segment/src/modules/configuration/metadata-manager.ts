import { SettingsManager } from "@saleor/app-sdk/settings-manager";
import { Client } from "urql";

import { EncryptedMetadataManagerFactory } from "@/lib/metadata-manager";

export const createSettingsManager = (
  client: Pick<Client, "query" | "mutation">,
  appId: string,
): SettingsManager => {
  const metadataManagerFactory = new EncryptedMetadataManagerFactory(process.env.SECRET_KEY!);

  return metadataManagerFactory.create(client, appId);
};
