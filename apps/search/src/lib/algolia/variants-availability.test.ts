import { type Client } from "urql";
import { describe, expect, it, type Mock, vi } from "vitest";

import { createVariantsAvailabilityFetcher } from "./variants-availability";

vi.mock("../logger", () => ({
  createLogger: () => ({ info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() }),
}));

const createApiClient = (
  respond: (variables: { channel: string; ids: string[] }) => {
    data?: unknown;
    error?: { message: string };
  },
) =>
  ({
    query: vi.fn((_document: unknown, variables: { channel: string; ids: string[] }) => ({
      toPromise: async () => respond(variables),
    })),
  }) as unknown as Pick<Client, "query"> & { query: Mock };

const variantsResponse = (nodes: Array<{ id: string; quantityAvailable: number | null }>) => ({
  data: { productVariants: { edges: nodes.map((node) => ({ node })) } },
});

describe("createVariantsAvailabilityFetcher", () => {
  it("Queries every channel and maps quantity per channel and variant", async () => {
    const apiClient = createApiClient(({ channel }) =>
      channel === "usd"
        ? variantsResponse([
            { id: "variant-1", quantityAvailable: 5 },
            { id: "variant-2", quantityAvailable: 0 },
          ])
        : variantsResponse([{ id: "variant-1", quantityAvailable: 0 }]),
    );

    const fetch = createVariantsAvailabilityFetcher(apiClient);

    const result = await fetch({
      variantIds: ["variant-1", "variant-2", "variant-1"],
      channelSlugs: ["usd", "eur", "usd"],
    });

    expect(result).toStrictEqual({
      usd: { "variant-1": 5, "variant-2": 0 },
      eur: { "variant-1": 0 },
    });
    expect(apiClient.query).toHaveBeenCalledTimes(2);
  });

  it("Throws instead of indexing a wrong value when Saleor returns an error", async () => {
    const fetch = createVariantsAvailabilityFetcher(
      createApiClient(() => ({ error: { message: "boom" } })),
    );

    await expect(fetch({ variantIds: ["variant-1"], channelSlugs: ["usd"] })).rejects.toThrowError(
      /boom/,
    );
  });

  it("Does not call Saleor when there is nothing to resolve", async () => {
    const apiClient = createApiClient(() => variantsResponse([]));
    const fetch = createVariantsAvailabilityFetcher(apiClient);

    expect(await fetch({ variantIds: [], channelSlugs: ["usd"] })).toStrictEqual({});
    expect(apiClient.query).not.toHaveBeenCalled();
  });
});
