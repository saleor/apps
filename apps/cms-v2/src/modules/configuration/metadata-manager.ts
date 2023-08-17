import { SettingsManager } from "@saleor/app-sdk/settings-manager";
import { EncryptedMetadataManagerFactory } from "@saleor/apps-shared";
import { Client } from "urql";

const metadataManagerFactory = new EncryptedMetadataManagerFactory(process.env.SECRET_KEY!);

export const createSettingsManager = (
  client: Pick<Client, "query" | "mutation">,
  appId: string,
): SettingsManager => {
  return metadataManagerFactory.create(client, appId);
};
