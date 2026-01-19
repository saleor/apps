import { Client } from "urql";
import { describe, expect, it, vi } from "vitest";

import {
  UntypedDeletePublicMetadataDocument,
  UntypedUpdatePublicMetadataDocument,
} from "../../../generated/graphql";
import { AVATAX_EXEMPTION_STATUS_METADATA_KEY } from "./avatax-exemption-status-metadata";
import { ExemptionStatusMetadataManager } from "./exemption-status-metadata-manager";

describe("ExemptionStatusMetadataManager", () => {
  it("sends UpdatePublicMetadata mutation with serialized exemption status", async () => {
    const mutation = vi.fn();

    const mockClient: Pick<Client, "mutation"> = {
      mutation: mutation as unknown as Client["mutation"],
    };

    vi.mocked(mutation).mockImplementationOnce(() => {
      return {
        async toPromise() {
          return {
            data: {
              updateMetadata: {
                errors: [],
              },
            },
          };
        },
      };
    });

    const manager = new ExemptionStatusMetadataManager(mockClient as Client);

    await manager.updateExemptionStatusMetadata("checkout-id", {
      exemptAmountTotal: 123,
      entityUseCode: "A",
      calculatedAt: new Date("2025-01-01T00:00:00.000Z").toISOString(),
    });

    expect(mutation).toHaveBeenCalledTimes(1);
    expect(mutation).toHaveBeenCalledWith(UntypedUpdatePublicMetadataDocument, {
      id: "checkout-id",
      input: [
        {
          key: AVATAX_EXEMPTION_STATUS_METADATA_KEY,
          value: JSON.stringify({
            exemptAmountTotal: 123,
            entityUseCode: "A",
            calculatedAt: "2025-01-01T00:00:00.000Z",
          }),
        },
      ],
    });
  });

  it("sends DeletePublicMetadata mutation with exemption status key", async () => {
    const mutation = vi.fn();

    const mockClient: Pick<Client, "mutation"> = {
      mutation: mutation as unknown as Client["mutation"],
    };

    vi.mocked(mutation).mockImplementationOnce(() => {
      return {
        async toPromise() {
          return {
            data: {
              deleteMetadata: {
                errors: [],
              },
            },
          };
        },
      };
    });

    const manager = new ExemptionStatusMetadataManager(mockClient as Client);

    await manager.deleteExemptionStatusMetadata("order-id");

    expect(mutation).toHaveBeenCalledTimes(1);
    expect(mutation).toHaveBeenCalledWith(UntypedDeletePublicMetadataDocument, {
      id: "order-id",
      keys: [AVATAX_EXEMPTION_STATUS_METADATA_KEY],
    });
  });
});
