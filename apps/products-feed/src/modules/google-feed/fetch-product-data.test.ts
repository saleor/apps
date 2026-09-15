import { type Client } from "urql";
import { describe, expect, it, vi } from "vitest";

import { fetchVariants, getCursors } from "./fetch-product-data";

describe("getCursors", () => {
  it("Fetches all cursors and returns them as array", async () => {
    const mockCursorResponse = vi.fn();

    const mockClient: Pick<Client, "query"> = {
      // @ts-expect-error - For testing I dont pass generic values
      query() {
        return {
          toPromise: mockCursorResponse,
        };
      },
    };

    mockCursorResponse
      .mockImplementationOnce(async () => {
        return {
          data: {
            productVariants: {
              pageInfo: {
                hasNextPage: true,
                endCursor: "cursor-2",
                startCursor: "cursor-1",
              },
            },
          },
        };
      })
      .mockImplementationOnce(async () => {
        return {
          data: {
            productVariants: {
              pageInfo: {
                hasNextPage: true,
                endCursor: "cursor-3",
                startCursor: "cursor-2",
              },
            },
          },
        };
      })
      .mockImplementationOnce(async () => {
        return {
          data: {
            productVariants: {
              pageInfo: {
                hasNextPage: false,
                endCursor: "cursor-4",
                startCursor: "cursor-3",
              },
            },
          },
        };
      });

    const result = await getCursors({
      channel: "default-channel",
      client: mockClient,
    });

    expect(result).to.toStrictEqual(["cursor-1", "cursor-2", "cursor-3"]);
  });
});

describe("fetchVariants", () => {
  const buildClient = (responses: unknown[]) => {
    const query = vi.fn();

    responses.forEach((response) => query.mockImplementationOnce(async () => response));

    return {
      // @ts-expect-error - For testing I dont pass generic values
      query: () => ({ toPromise: query }),
      calls: query,
    } as unknown as Client & { calls: ReturnType<typeof vi.fn> };
  };

  it("Skips variants whose product was filtered out as not publicly available", async () => {
    const client = buildClient([
      {
        data: {
          productVariants: {
            edges: [
              { node: { id: "variant-published", product: { id: "product-published" } } },
              { node: { id: "variant-hidden", product: { id: "product-hidden" } } },
            ],
          },
        },
      },
      {
        // product-hidden is not returned - it does not pass the `where` filter
        data: { products: { edges: [{ node: { id: "product-published", name: "Published" } }] } },
      },
    ]);

    const result = await fetchVariants({ client, channel: "default-channel" });

    expect(result).toStrictEqual([
      {
        id: "variant-published",
        product: { id: "product-published", name: "Published" },
      },
    ]);
  });
});
