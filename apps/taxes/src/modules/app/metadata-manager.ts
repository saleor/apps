import { EncryptedMetadataManager, MetadataEntry } from "@saleor/app-sdk/settings-manager";
import { Client } from "urql";
import {
  FetchAppDetailsDocument,
  FetchAppDetailsQuery,
  UpdateMetadataDocument,
} from "../../../generated/graphql";
import { logger as pinoLogger } from "../../lib/logger";

export async function fetchAllMetadata(client: Client): Promise<MetadataEntry[]> {
  const logger = pinoLogger.child({ service: "fetchAllMetadata" });

  logger.debug("Fetching metadata from Saleor");

  const { error, data } = await client
    .query<FetchAppDetailsQuery>(FetchAppDetailsDocument, {})
    .toPromise();

  // * `metadata` name is required for secrets censorship
  logger.debug({ error, metadata: data }, "Metadata fetched");

  if (error) {
    return [];
  }

  return data?.app?.privateMetadata.map((md) => ({ key: md.key, value: md.value })) || [];
}

export async function mutateMetadata(client: Client, metadata: MetadataEntry[]) {
  const logger = pinoLogger.child({ service: "mutateMetadata" });

  logger.debug({ metadata }, "Mutating metadata");
  // to update the metadata, ID is required
  const { error: idQueryError, data: idQueryData } = await client
    .query(FetchAppDetailsDocument, {})
    .toPromise();

  logger.debug({ error: idQueryError, data: idQueryData }, "Metadata mutated");

  if (idQueryError) {
    throw new Error(
      "Could not fetch the app id. Please check if auth data for the client are valid."
    );
  }

  const appId = idQueryData?.app?.id;

  if (!appId) {
    throw new Error("Could not fetch the app ID");
  }

  const { error: mutationError, data: mutationData } = await client
    .mutation(UpdateMetadataDocument, {
      id: appId,
      input: metadata,
    })
    .toPromise();

  if (mutationError) {
    throw new Error(`Mutation error: ${mutationError.message}`);
  }

  return (
    mutationData?.updatePrivateMetadata?.item?.privateMetadata.map((md) => ({
      key: md.key,
      value: md.value,
    })) || []
  );
}

export const createSettingsManager = (client: Client) => {
  /**
   * EncryptedMetadataManager gives you interface to manipulate metadata and cache values in memory.
   * We recommend it for production, because all values are encrypted.
   * If your use case require plain text values, you can use MetadataManager.
   */
  return new EncryptedMetadataManager({
    // Secret key should be randomly created for production and set as environment variable
    encryptionKey: process.env.SECRET_KEY!,
    fetchMetadata: () => fetchAllMetadata(client),
    mutateMetadata: (metadata) => mutateMetadata(client, metadata),
  });
};
