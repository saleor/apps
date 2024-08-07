import { describe, expect, it, vi } from "vitest";
import { Client } from "urql";

import { getCursors } from "./fetch-product-data";

describe("getCursors", () => {
  it("loads cursor for each variant page ", async () => {
    const client = {
      query: vi.fn().mockReturnValue({
        toPromise: vi
          .fn()
          .mockResolvedValueOnce({
            data: {
              productVariants: {
                pageInfo: {
                  hasNextPage: true,
                  endCursor: "cursor-1",
                },
              },
            },
          })
          .mockResolvedValueOnce({
            data: {
              productVariants: {
                pageInfo: {
                  hasNextPage: true,
                  endCursor: "cursor-2",
                },
              },
            },
          })
          .mockResolvedValueOnce({
            data: {
              productVariants: {
                pageInfo: {
                  hasNextPage: true,
                  endCursor: "cursor-3",
                },
              },
            },
          })
          .mockResolvedValue({
            data: {
              productVariants: {
                pageInfo: {
                  hasNextPage: false,
                  endCursor: "cursor-4",
                },
              },
            },
          }),
      }),
    } as unknown as Client;

    const cursors = await getCursors({
      client,
      channel: "channel-1",
    });

    expect(cursors).toEqual(["cursor-1", "cursor-2", "cursor-3"]);
  });
});
