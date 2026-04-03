import { type APL } from "@saleor/app-sdk/APL";
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

export async function fetchMetadataRotationItems(
  apl: Pick<APL, "getAll">,
): Promise<RotationItem<MetadataItemContext>[]> {
  const installations = await apl.getAll();
  const items: RotationItem<MetadataItemContext>[] = [];

  for (const { token, saleorApiUrl } of installations) {
    const client = createGraphQLClient({ saleorApiUrl, token });

    const { data, error } = await client
      .query(FetchAppDetailsQuery, {}, { requestPolicy: "network-only" })
      .toPromise();

    if (error || !data?.app) {
      // eslint-disable-next-line no-console
      console.error(
        `Failed to fetch metadata for ${saleorApiUrl}: ${error?.message ?? "No app data"}`,
      );
      continue;
    }

    const appId = data.app.id as string;
    const metadata = data.app.privateMetadata as Array<{ key: string; value: string }>;

    items.push({
      id: saleorApiUrl,
      encryptedFields: metadata.map((entry) => ({
        name: entry.key,
        encryptedValue: entry.value,
      })),
      original: { client, appId },
    });
  }

  return items;
}
