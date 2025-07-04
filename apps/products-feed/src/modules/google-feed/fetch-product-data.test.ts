import { Client } from "urql";
import { describe, expect, it, vi } from "vitest";

import { getCursors } from "./fetch-product-data";

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
