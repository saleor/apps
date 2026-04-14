import { type APL } from "@saleor/app-sdk/APL";
import { type Logger } from "@saleor/apps-logger";
import { gql } from "urql";

import { createGraphQLClient } from "../create-graphql-client";
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

export interface MetadataItemContext {
  client: ReturnType<typeof createGraphQLClient>;
  appId: string;
}

export async function* fetchMetadataRotationItems(
  apl: Pick<APL, "getAll">,
  logger: Logger,
  encryptedFieldNames: readonly string[],
): AsyncGenerator<RotationItem<MetadataItemContext>> {
  const installations = await apl.getAll();
  const encryptedFieldSet = new Set(encryptedFieldNames);

  for (const { token, saleorApiUrl } of installations) {
    const client = createGraphQLClient({ saleorApiUrl, token });

    const { data, error } = await client
      .query(FetchAppDetailsQuery, {}, { requestPolicy: "network-only" })
      .toPromise();

    if (error || !data?.app) {
      logger.error(
        `Failed to fetch metadata for ${saleorApiUrl}: ${error?.message ?? "No app data"}`,
      );
      continue;
    }

    const appId = data.app.id as string;
    const metadata = data.app.privateMetadata as Array<{ key: string; value: string }>;

    yield {
      id: saleorApiUrl,
      encryptedFields: metadata
        .filter((entry) => encryptedFieldSet.has(entry.key))
        .map((entry) => ({
          name: entry.key,
          encryptedValue: entry.value,
        })),
      original: { client, appId },
    };
  }
}
