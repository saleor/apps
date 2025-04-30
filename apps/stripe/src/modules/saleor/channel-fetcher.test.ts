import { beforeEach, describe, expect, it, vi } from "vitest";

import { mockedGraphqlClient } from "@/__tests__/mocks/graphql-client";
import { ChannelFragment } from "@/generated/graphql";
import { ChannelsFetcher } from "@/modules/saleor/channel-fetcher";

describe("ChannelFetcher", () => {
  beforeEach(() => {
    vi.spyOn(mockedGraphqlClient, "request");
  });

  it("Returns FetchError if graphql query fails", async () => {
    const instance = new ChannelsFetcher(mockedGraphqlClient);

    vi.mocked(mockedGraphqlClient.request).mockImplementationOnce(async () => {
      throw new Error("Test gql error");
    });

    const result = await instance.fetchChannels();

    expect(result._unsafeUnwrapErr()).toMatchInlineSnapshot(`
      [FetchError: Test gql error
      Failed to fetch channels]
    `);
  });

  it("Returns FetchError if channels are missing", async () => {
    const instance = new ChannelsFetcher(mockedGraphqlClient);

    vi.mocked(mockedGraphqlClient.request).mockImplementationOnce(async () => {
      return {
        data: {
          channels: null,
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
      },
      {
        slug: "another-channel",
        id: "2",
      },
    ];

    vi.mocked(mockedGraphqlClient.request).mockImplementationOnce(async () => {
      return {
        channels: channels,
      };
    });

    const result = await instance.fetchChannels();

    expect(result._unsafeUnwrap()).toStrictEqual(channels);
  });
});
