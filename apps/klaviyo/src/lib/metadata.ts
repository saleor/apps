import { EncryptedMetadataManager, MetadataEntry } from "@saleor/app-sdk/settings-manager";
import { Client } from "urql";

import {
  FetchAppDetailsDocument,
  FetchAppDetailsQuery,
  UpdateAppMetadataDocument,
} from "../../generated/graphql";
import { settingsManagerSecretKey } from "../../saleor-app";
import { createLogger } from "../logger";

const logger = createLogger("MetadataManager");

/*
 * Function is using urql graphql client to fetch all available metadata.
 * Before returning query result, we are transforming response to list of objects with key and value fields
 * which can be used by the manager.
 * Result of this query is cached by the manager.
 */
export async function fetchAllMetadata(client: Client): Promise<MetadataEntry[]> {
  const { error, data } = await client
    .query<FetchAppDetailsQuery>(FetchAppDetailsDocument, {})
    .toPromise();

  if (error) {
    logger.error("Error during fetching the metadata: ", { error });
    return [];
  }

  return data?.app?.privateMetadata.map((md) => ({ key: md.key, value: md.value })) || [];
}

/*
 * Mutate function takes urql client and metadata entries, and construct mutation to the API.
 * Before data are send, additional query for required App ID is made.
 * The manager will use updated entries returned by this mutation to update it's cache.
 */
export async function mutateMetadata(client: Client, appId: string, metadata: MetadataEntry[]) {
  const { error: mutationError, data: mutationData } = await client
    .mutation(UpdateAppMetadataDocument, {
      id: appId,
      input: metadata,
    })
    .toPromise();

  if (mutationError) {
    logger.error("Mutation error: ", { error: mutationError });
    throw new Error(`Mutation error: ${mutationError.message}`);
  }

  return (
    mutationData?.updatePrivateMetadata?.item?.privateMetadata.map((md) => ({
      key: md.key,
      value: md.value,
    })) || []
  );
}

export const createSettingsManager = (client: Client, appId: string) =>
  /*
   * EncryptedMetadataManager gives you interface to manipulate metadata and cache values in memory.
   * We recommend it for production, because all values are encrypted.
   * If your use case require plain text values, you can use MetadataManager.
   */
  new EncryptedMetadataManager({
    // Secret key should be randomly created for production and set as environment variable
    encryptionKey: settingsManagerSecretKey,
    fetchMetadata: () => fetchAllMetadata(client),
    mutateMetadata: (metadata) => mutateMetadata(client, appId, metadata),
  });
