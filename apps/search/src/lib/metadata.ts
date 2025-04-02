import { SettingsManager } from "@saleor/app-sdk/settings-manager";
import { EncryptedMetadataManagerFactory } from "@saleor/apps-shared/metadata-manager";
import { Client } from "urql";

export const createSettingsManager = (
  client: Pick<Client, "query" | "mutation">,
  appId: string,
): SettingsManager => {
  const metadataManagerFactory = new EncryptedMetadataManagerFactory(process.env.SECRET_KEY!);

  return metadataManagerFactory.create(client, appId);
};
