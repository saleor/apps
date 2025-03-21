import { EncryptedMetadataManager, MetadataEntry } from "@saleor/app-sdk/settings-manager";
import { Client } from "urql";

import { env } from "@/env";
import { AppMetadataCache } from "@/lib/app-metadata-cache";
import { createLogger } from "@/logger";

import { BaseError } from "@/error";
import {
  DeleteAppMetadataDocument,
  FetchAppDetailsDocument,
  FetchAppDetailsQuery,
  UpdatePrivateMetadataDocument,
} from "../../../generated/graphql";

const logger = createLogger("SettingsManager");

const MetadataManagerMutationError = BaseError.subclass("MetadataManagerMutationError");
const MetadataManagerDeleteError = BaseError.subclass("MetadataManagerDeleteError");

export async function fetchAllMetadata(client: Pick<Client, "query">): Promise<MetadataEntry[]> {
  const { error, data } = await client
    .query<FetchAppDetailsQuery>(FetchAppDetailsDocument, {})
    .toPromise();

  if (error) {
    return [];
  }

  return data?.app?.privateMetadata.map((md) => ({ key: md.key, value: md.value })) || [];
}

export async function updateMetadata(
  client: Pick<Client, "mutation">,
  metadata: MetadataEntry[],
  appId: string,
) {
  const { error: mutationError, data: mutationData } = await client
    .mutation(UpdatePrivateMetadataDocument, {
      id: appId,
      input: metadata,
    })
    .toPromise();

  if (mutationError) {
    throw new MetadataManagerMutationError("Error during metadata update", {
      cause: mutationError,
    });
  }

  return (
    mutationData?.updatePrivateMetadata?.item?.privateMetadata.map((md) => ({
      key: md.key,
      value: md.value,
    })) || []
  );
}

async function deleteMetadata(
  client: Pick<Client, "mutation">,
  keys: string[],
  appId: string,
): Promise<void> {
  const { error } = await client
    .mutation(DeleteAppMetadataDocument, {
      id: appId,
      keys,
    })
    .toPromise();

  if (error) {
    throw new MetadataManagerDeleteError("Error during metadata deletion", {
      cause: error,
    });
  }
}

export const createSettingsManager = (
  client: Pick<Client, "mutation" | "query">,
  appId: string,
  /**
   * Cache is a temporary solution, once we refactor the app we should pass it properly instead implicit caching
   */
  cache: AppMetadataCache,
) => {
  /*
   * EncryptedMetadataManager gives you interface to manipulate metadata and cache values in memory.
   * We recommend it for production, because all values are encrypted.
   * If your use case require plain text values, you can use MetadataManager.
   */
  return new EncryptedMetadataManager({
    // Secret key should be randomly created for production and set as environment variable
    encryptionKey: env.SECRET_KEY,
    fetchMetadata: async () => {
      const cachedMetadata = cache.getRawMetadata();

      if (cachedMetadata) {
        logger.debug("Using cached metadata");

        return cachedMetadata;
      }

      logger.debug("Cache not found, fetching metadata");
      return fetchAllMetadata(client);
    },
    mutateMetadata: (metadata) => updateMetadata(client, metadata, appId),
    deleteMetadata: (keys) => deleteMetadata(client, keys, appId),
  });
};
