import { encrypt } from "@saleor/app-sdk/settings-manager";
import { Client } from "urql";
import { describe, expect, it, Mock, vi } from "vitest";

import { AppMetadataCache } from "../../lib/app-metadata-cache";
import { createSettingsManager } from "./metadata-manager";

const mockGqlClient: Pick<Client, "query" | "mutation"> = {
  mutation: vi.fn(),
  query: vi.fn(),
};

const SECRET_KEY = "SECRET_KEY";
const METADATA_KEY = "foo";
const METADATA_VALUE = "bar";

vi.stubEnv("SECRET_KEY", SECRET_KEY);

describe("MetadataManager", () => {
  it("Consumes cache if exists", async () => {
    const cache = new AppMetadataCache();
    const manager = createSettingsManager(mockGqlClient, "test-id", cache);

    function someExecution() {
      cache.setMetadata([
        {
          key: METADATA_KEY,
          value: encrypt(METADATA_VALUE, SECRET_KEY),
        },
      ]);

      return manager.get(METADATA_KEY);
    }

    return expect(cache.wrap(() => someExecution())).resolves.toBe("bar");
  });

  it("Still works if cache is empty", () => {
    const cache = new AppMetadataCache();
    const manager = createSettingsManager(mockGqlClient, "test-id", cache);

    (mockGqlClient.query as Mock).mockImplementationOnce(() => {
      return {
        async toPromise() {
          return {
            data: {
              app: {
                privateMetadata: [
                  {
                    key: METADATA_KEY,
                    value: encrypt(METADATA_VALUE, SECRET_KEY),
                  },
                ],
              },
            },
          };
        },
      };
    });

    function someExecution() {
      return manager.get(METADATA_KEY);
    }

    return expect(cache.wrap(() => someExecution())).resolves.toBe(METADATA_VALUE);
  });
});
