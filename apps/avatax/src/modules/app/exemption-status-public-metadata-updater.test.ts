import { Client } from "urql";
import { describe, expect, it, vi } from "vitest";

import {
  UntypedDeletePublicMetadataDocument,
  UntypedUpdatePublicMetadataDocument,
} from "../../../generated/graphql";
import { AVATAX_EXEMPTION_STATUS_METADATA_KEY } from "./avatax-exemption-status-metadata";
import { updateExemptionStatusPublicMetadata } from "./exemption-status-public-metadata-updater";

describe("updateExemptionStatusPublicMetadata", () => {
  it("sends update metadata mutation when exemption is applied and metadata should be updated", async () => {
    const mutation = vi.fn();

    const client: Pick<Client, "mutation"> = {
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

    const calculatedAt = new Date("2025-01-01T00:00:00.000Z");

    await updateExemptionStatusPublicMetadata({
      id: "checkout-id",
      client,
      isExemptionApplied: true,
      currentMetadataValue: null,
      next: {
        exemptAmountTotal: 10,
        entityUseCode: "A",
        calculatedAt,
      },
      onError: () => {
        throw new Error("onError should not be called");
      },
    });

    expect(mutation).toHaveBeenCalledTimes(1);
    expect(mutation).toHaveBeenCalledWith(UntypedUpdatePublicMetadataDocument, {
      id: "checkout-id",
      input: [
        {
          key: AVATAX_EXEMPTION_STATUS_METADATA_KEY,
          value: JSON.stringify({
            exemptAmountTotal: 10,
            entityUseCode: "A",
            calculatedAt: "2025-01-01T00:00:00.000Z",
          }),
        },
      ],
    });
  });

  it("sends delete metadata mutation when exemption is not applied and metadata exists", async () => {
    const mutation = vi.fn();

    const client: Pick<Client, "mutation"> = {
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

    await updateExemptionStatusPublicMetadata({
      id: "order-id",
      client,
      isExemptionApplied: false,
      currentMetadataValue: '{"exemptAmountTotal":10,"calculatedAt":"2025-01-01T00:00:00.000Z"}',
      next: {
        exemptAmountTotal: 0,
        calculatedAt: new Date("2025-01-01T00:00:00.000Z"),
      },
      onError: () => {
        throw new Error("onError should not be called");
      },
    });

    expect(mutation).toHaveBeenCalledTimes(1);
    expect(mutation).toHaveBeenCalledWith(UntypedDeletePublicMetadataDocument, {
      id: "order-id",
      keys: [AVATAX_EXEMPTION_STATUS_METADATA_KEY],
    });
  });
});
