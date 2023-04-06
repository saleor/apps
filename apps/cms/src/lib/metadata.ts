import { EncryptedMetadataManager, MetadataEntry } from "@saleor/app-sdk/settings-manager";
import { Client } from "urql";

import {
  FetchAppDetailsDocument,
  FetchAppDetailsQuery,
  FetchProductVariantMetadataDocument,
  FetchProductVariantMetadataQuery,
  UpdateAppMetadataDocument,
} from "../../generated/graphql";
import { logger as pinoLogger } from "../lib/logger";

// Function is using urql graphql client to fetch all available metadata.
// Before returning query result, we are transforming response to list of objects with key and value fields
// which can be used by the manager.
// Result of this query is cached by the manager.
export async function fetchAllMetadata(client: Client): Promise<MetadataEntry[]> {
  const logger = pinoLogger.child({
    function: "fetchAllMetadata",
  });

  const { error, data } = await client
    .query<FetchAppDetailsQuery>(FetchAppDetailsDocument, {})
    .toPromise();

  if (error) {
    logger.debug("Error during fetching the metadata", error);
    return [];
  }

  return data?.app?.privateMetadata.map((md) => ({ key: md.key, value: md.value })) || [];
}

// Mutate function takes urql client and metadata entries, and construct mutation to the API.
// Before data are send, additional query for required App ID is made.
// The manager will use updated entries returned by this mutation to update it's cache.
export async function mutateMetadata(client: Client, metadata: MetadataEntry[]) {
  const logger = pinoLogger.child({
    function: "mutateMetadata",
  });

  // to update the metadata, ID is required
  const { error: idQueryError, data: idQueryData } = await client
    .query(FetchAppDetailsDocument, {})
    .toPromise();

  if (idQueryError) {
    logger.debug("Could not fetch the app id", idQueryError);
    throw new Error(
      "Could not fetch the app id. Please check if auth data for the client are valid."
    );
  }

  const appId = idQueryData?.app?.id;

  if (!appId) {
    logger.debug("Missing app id");
    throw new Error("Could not fetch the app ID");
  }

  const { error: mutationError, data: mutationData } = await client
    .mutation(UpdateAppMetadataDocument, {
      id: appId,
      input: metadata,
    })
    .toPromise();

  if (mutationError) {
    logger.debug("Mutation error", mutationError);
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
  // EncryptedMetadataManager gives you interface to manipulate metadata and cache values in memory.
  // We recommend it for production, because all values are encrypted.
  // If your use case require plain text values, you can use MetadataManager.
  return new EncryptedMetadataManager({
    // Secret key should be randomly created for production and set as environment variable
    encryptionKey: process.env.SECRET_KEY!,
    fetchMetadata: () => fetchAllMetadata(client),
    mutateMetadata: (metadata) => mutateMetadata(client, metadata),
  });
};

export async function fetchProductVariantMetadata(
  client: Client,
  productId: string
): Promise<MetadataEntry[]> {
  const logger = pinoLogger.child({
    function: "fetchProductVariantMetadata",
    productId,
  });

  const { error, data } = await client
    .query<FetchProductVariantMetadataQuery>(FetchProductVariantMetadataDocument, {
      id: productId,
    })
    .toPromise();

  if (error) {
    logger.debug("Error during fetching product metadata", error);
    return [];
  }

  return data?.productVariant?.metadata.map((md) => ({ key: md.key, value: md.value })) || [];
}
