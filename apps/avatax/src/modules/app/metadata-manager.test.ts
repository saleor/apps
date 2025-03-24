import { encrypt } from "@saleor/app-sdk/settings-manager";
import { Client } from "urql";
import { describe, expect, it, vi } from "vitest";

import { AppMetadataCache } from "../../lib/app-metadata-cache";
import { createSettingsManager } from "./metadata-manager";

const mockGqlClient: Pick<Client, "query" | "mutation"> = {
  mutation: vi.fn(),
  query: vi.fn(),
};

const METADATA_KEY = "foo";
const METADATA_VALUE = "bar";

describe("MetadataManager", () => {
  it("Consumes cache if exists", async () => {
    const cache = new AppMetadataCache();
    const manager = createSettingsManager(mockGqlClient, "test-id", cache);

    async function someExecution() {
      cache.setMetadata([
        {
          key: METADATA_KEY,
          value: encrypt(METADATA_VALUE, "test_secret_key"),
        },
      ]);

      const result = await manager.get(METADATA_KEY);

      return Response.json({ result });
    }

    const response = await cache.wrapNextAppRouterHandler(() => someExecution());
    const body = (await response.json()) as { result: string };

    expect(body.result).toBe(METADATA_VALUE);
  });

  it("Still works if cache is empty", async () => {
    const cache = new AppMetadataCache();
    const manager = createSettingsManager(mockGqlClient, "test-id", cache);

    // @ts-expect-error mocking the request for testing
    vi.mocked(mockGqlClient.query).mockImplementationOnce(() => {
      return {
        async toPromise() {
          return {
            data: {
              app: {
                privateMetadata: [
                  {
                    key: METADATA_KEY,
                    value: encrypt(METADATA_VALUE, "test_secret_key"),
                  },
                ],
              },
            },
          };
        },
      };
    });

    async function someExecution() {
      const result = await manager.get(METADATA_KEY);

      return Response.json({ result });
    }

    const response = await cache.wrapNextAppRouterHandler(() => someExecution());
    const body = (await response.json()) as { result: string };

    expect(body.result).toBe(METADATA_VALUE);
  });
});
