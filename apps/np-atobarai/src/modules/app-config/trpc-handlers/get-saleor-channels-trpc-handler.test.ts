import { err, ok } from "neverthrow";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { mockedAppConfigRepo } from "@/__tests__/mocks/app-config/mocked-app-config-repo";
import { mockedGraphqlClient } from "@/__tests__/mocks/graphql-client";
import { mockAuthData } from "@/__tests__/mocks/saleor/mocked-auth-data";
import { mockedSaleorApiUrl } from "@/__tests__/mocks/saleor/mocked-saleor-api-url";
import { mockedSaleorAppId } from "@/__tests__/mocks/saleor/mocked-saleor-app-id";
import { TEST_Procedure } from "@/__tests__/trpc-testing-procedure";
import { ChannelFragment } from "@/generated/graphql";
import { GetSaleorChannelsTrpcHandler } from "@/modules/app-config/trpc-handlers/get-saleor-channels-trpc-handler";
import { ChannelsFetcher } from "@/modules/saleor/channel-fetcher";
import { router } from "@/modules/trpc/trpc-server";

const getTestCaller = () => {
  const channelsFetcher = new ChannelsFetcher(mockedGraphqlClient);

  vi.spyOn(channelsFetcher, "fetchChannels");

  const instance = new GetSaleorChannelsTrpcHandler({
    channelsFetcherFactory: () => channelsFetcher,
  });

  // @ts-expect-error - context doesnt match but its applied in test
  instance.baseProcedure = TEST_Procedure;

  const testRouter = router({
    testProcedure: instance.getTrpcProcedure(),
  });

  return {
    mockedAppConfigRepo,
    channelsFetcher,
    caller: testRouter.createCaller({
      appId: mockedSaleorAppId,
      saleorApiUrl: mockedSaleorApiUrl,
      token: mockAuthData.token,
      configRepo: mockedAppConfigRepo,
      apiClient: mockedGraphqlClient,
      appUrl: "https://localhost:3000",
    }),
  };
};

describe("GetConfigTrpcHandler", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("Returns internal server error if channels could not been fetched", async () => {
    const { caller, channelsFetcher } = getTestCaller();

    vi.mocked(channelsFetcher.fetchChannels).mockImplementationOnce(async () => {
      return err(
        new ChannelsFetcher.FetchError("Failed to fetch channels - channels data missing"),
      );
    });

    return expect(() => caller.testProcedure()).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: Failed to fetch channels, contact support]`,
    );
  });

  it("Returns list of channels if properly fetched", async () => {
    const { caller, channelsFetcher } = getTestCaller();

    vi.mocked(channelsFetcher.fetchChannels).mockImplementationOnce(async () => {
      const channels: ChannelFragment[] = [
        {
          slug: "slug-1",
          id: "id-1",
          currencyCode: "JPY",
        },
        {
          slug: "slug-2",
          id: "id-2",
          currencyCode: "JPY",
        },
      ];

      return ok(channels);
    });

    const result = await caller.testProcedure();

    expect(result).toStrictEqual([
      {
        slug: "slug-1",
        id: "id-1",
        currencyCode: "JPY",
      },
      {
        slug: "slug-2",
        id: "id-2",
        currencyCode: "JPY",
      },
    ]);
  });
});
