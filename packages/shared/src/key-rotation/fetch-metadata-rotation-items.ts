import { type APL } from "@saleor/app-sdk/APL";
import { type Logger } from "@saleor/apps-logger";
import { ObservabilityAttributes } from "@saleor/apps-otel/src/observability-attributes";
import { gql } from "urql";

import { type createGraphQLClient } from "../create-graphql-client";
import { matchesAnyEncryptedMetadataKey } from "./metadata-key-matcher";
import type { RotationItem } from "./secret-key-rotation-runner";

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

type GraphQLClient = ReturnType<typeof createGraphQLClient>;

export interface MetadataItemContext {
  client: GraphQLClient;
  appId: string;
}

export async function* fetchMetadataRotationItems({
  apl,
  logger,
  encryptedFieldNames,
  createClient,
}: {
  apl: Pick<APL, "getAll">;
  logger: Logger;
  encryptedFieldNames: readonly string[];
  /**
   * The app's own client factory, so requests carry its User-Agent and instrumentation.
   */
  createClient: (args: { saleorApiUrl: string; token: string }) => GraphQLClient;
}): AsyncGenerator<RotationItem<MetadataItemContext>> {
  const installations = await apl.getAll();

  for (const { token, saleorApiUrl } of installations) {
    const client = createClient({ saleorApiUrl, token });

    const { data, error } = await client
      .query(FetchAppDetailsQuery, {}, { requestPolicy: "network-only" })
      .toPromise();

    if (error || !data?.app) {
      logger.error(`Failed to fetch metadata: ${error?.message ?? "No app data"}`, {
        [ObservabilityAttributes.SALEOR_API_URL]: saleorApiUrl,
      });
      continue;
    }

    const appId = data.app.id as string;
    const metadata = data.app.privateMetadata as Array<{ key: string; value: string }>;

    yield {
      id: saleorApiUrl,
      logAttributes: { [ObservabilityAttributes.SALEOR_API_URL]: saleorApiUrl },
      encryptedFields: metadata
        .filter((entry) => matchesAnyEncryptedMetadataKey(entry.key, encryptedFieldNames))
        .map((entry) => ({
          name: entry.key,
          encryptedValue: entry.value,
        })),
      original: { client, appId },
    };
  }
}
