import { beforeEach, describe, expect, it, vi } from "vitest";

import { mockedGraphqlClient } from "@/__tests__/mocks/graphql-client";
import { ChannelFragment } from "@/generated/graphql";
import { ChannelsFetcher } from "@/modules/saleor/channel-fetcher";

describe("ChannelFetcher", () => {
  beforeEach(() => {
    vi.spyOn(mockedGraphqlClient, "query");
  });

  it("Returns FetchError if graphql query fails", async () => {
    const instance = new ChannelsFetcher(mockedGraphqlClient);

    // @ts-expect-error - patching only subset
    vi.mocked(mockedGraphqlClient.query).mockImplementationOnce(() => {
      return {
        async toPromise() {
          return {
            error: "Test gql error",
          };
        },
      };
    });

    const result = await instance.fetchChannels();

    expect(result._unsafeUnwrapErr()).toMatchInlineSnapshot(`
      [FetchError: Test gql error
      Failed to fetch channels]
    `);
  });

  it("Returns FetchError if channels are missing", async () => {
    const instance = new ChannelsFetcher(mockedGraphqlClient);

    // @ts-expect-error - patching only subset
    vi.mocked(mockedGraphqlClient.query).mockImplementationOnce(() => {
      return {
        async toPromise() {
          return {
            data: {
              channels: null,
            },
          };
        },
      };
    });

    const result = await instance.fetchChannels();

    expect(result).toMatchInlineSnapshot(`
      Err {
        "error": [FetchError: Failed to fetch channels - channels data missing],
      }
    `);
  });

  it("Returns channels fragments returned from graphql", async () => {
    const instance = new ChannelsFetcher(mockedGraphqlClient);

    const channels: ChannelFragment[] = [
      {
        slug: "default-channel",
        id: "1",
        currencyCode: "JPY",
      },
      {
        slug: "another-channel",
        id: "2",
        currencyCode: "JPY",
      },
    ];

    // @ts-expect-error - patching only subset
    vi.mocked(mockedGraphqlClient.query).mockImplementationOnce(() => {
      return {
        async toPromise() {
          return {
            data: {
              channels: channels,
            },
          };
        },
      };
    });

    const result = await instance.fetchChannels();

    expect(result._unsafeUnwrap()).toStrictEqual(channels);
  });

  it("Returns channels fragments returned from graphql and optionally filter by currency", async () => {
    const instance = new ChannelsFetcher(mockedGraphqlClient);

    const channels: ChannelFragment[] = [
      {
        slug: "default-channel",
        id: "1",
        currencyCode: "USD",
      },
      {
        slug: "another-channel",
        id: "2",
        currencyCode: "JPY",
      },
    ];

    // @ts-expect-error - patching only subset
    vi.mocked(mockedGraphqlClient.query).mockImplementationOnce(() => {
      return {
        async toPromise() {
          return {
            data: {
              channels: channels,
            },
          };
        },
      };
    });

    const result = await instance.fetchChannels("JPY");

    expect(result._unsafeUnwrap()).toStrictEqual([channels[1]]);
  });
});
