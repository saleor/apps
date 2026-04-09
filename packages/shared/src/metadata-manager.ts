import {
  EncryptedMetadataManager,
  type MetadataEntry,
  type SettingsManager,
} from "@saleor/app-sdk/settings-manager";
import { type Logger } from "@saleor/apps-logger";
import { type Client, gql } from "urql";

import { createRotatingDecryptCallback } from "./key-rotation";

const UpdateAppMetadataMutation = gql`
  mutation UpdateAppMetadata($id: ID!, $input: [MetadataInput!]!) {
    updatePrivateMetadata(id: $id, input: $input) {
      item {
        privateMetadata {
          key
          value
        }
      }
    }
  }
`;

const FetchAppDetailsQuery = gql`
  query FetchAppDetails {
    app {
      id
      privateMetadata {
        key
        value
      }
    }
  }
`;

const DeletePrivateMetadataMutation = gql`
  mutation RemovePrivateMetadata($id: ID!, $keys: [String!]!) {
    deletePrivateMetadata(id: $id, keys: $keys) {
      errors {
        message
      }
    }
  }
`;

/**
 * To avoid a graphql-schema build step, manually set types for the queries and mutations.
 */
type FetchAppPrivateMetadataQuery = {
  __typename?: "Query";
  app?: {
    __typename?: "App";
    id: string;
    privateMetadata: Array<{ __typename?: "MetadataItem"; key: string; value: string }>;
  } | null;
};

type UpdateAppPrivateMetadataMutation = {
  __typename?: "Mutation";
  updatePrivateMetadata?: {
    __typename?: "UpdatePrivateMetadata";
    item?: {
      __typename?: "App";
      privateMetadata: Array<{ __typename?: "MetadataItem"; key: string; value: string }>;
    } | null;
  } | null;
};

export type MetadataManagerGraphqlClient = Pick<Client, "mutation" | "query">;

async function fetchAllPrivateMetadata({
  client,
  logger,
}: {
  client: MetadataManagerGraphqlClient;
  logger: Logger;
}): Promise<MetadataEntry[]> {
  const { error, data } = await client
    .query<FetchAppPrivateMetadataQuery>(FetchAppDetailsQuery, {})
    .toPromise();

  if (error) {
    const cause =
      error.networkError?.cause instanceof Error
        ? (error.networkError.cause as NodeJS.ErrnoException)
        : undefined;

    logger.error("Failed to fetch app metadata", {
      errorMessage: error.message,
      networkErrorMessage: error.networkError?.message,
      causeCode: cause?.code,
      causeMessage: cause?.message,
    });

    return [];
  }

  return data?.app?.privateMetadata.map((md) => ({ key: md.key, value: md.value })) || [];
}

async function updatePrivateMetadata({
  client,
  metadata,
  appId,
  logger,
}: {
  client: MetadataManagerGraphqlClient;
  metadata: MetadataEntry[];
  appId: string;
  logger: Logger;
}) {
  const { error, data } = await client
    .mutation<UpdateAppPrivateMetadataMutation>(UpdateAppMetadataMutation, {
      id: appId,
      input: metadata,
    })
    .toPromise();

  if (error) {
    const cause =
      error.networkError?.cause instanceof Error
        ? (error.networkError.cause as NodeJS.ErrnoException)
        : undefined;

    logger.error("Failed to update app metadata", {
      errorMessage: error.message,
      networkErrorMessage: error.networkError?.message,
      causeCode: cause?.code,
      causeMessage: cause?.message,
    });

    throw new Error(`Mutation error: ${error.message}`);
  }

  return (
    data?.updatePrivateMetadata?.item?.privateMetadata.map((md) => ({
      key: md.key,
      value: md.value,
    })) || []
  );
}

export class EncryptedMetadataManagerFactory {
  constructor(
    private encryptionKey: string,
    private fallbackKeys: string[] = [],
    private logger: Logger,
  ) {
    if (!encryptionKey) {
      throw new Error("Encryption key is required");
    }
  }

  create(client: MetadataManagerGraphqlClient, appId: string): SettingsManager {
    return new EncryptedMetadataManager({
      encryptionKey: this.encryptionKey,
      fetchMetadata: () => fetchAllPrivateMetadata({ client, logger: this.logger }),
      mutateMetadata: (metadata) =>
        updatePrivateMetadata({
          client,
          metadata,
          appId,
          logger: this.logger,
        }),
      async deleteMetadata(keys) {
        await client.mutation(DeletePrivateMetadataMutation, {
          id: appId,
          keys: keys,
        });
      },
      ...(this.fallbackKeys.length > 0 && {
        decryptionMethod: createRotatingDecryptCallback(this.encryptionKey, this.fallbackKeys),
      }),
    });
  }
}
