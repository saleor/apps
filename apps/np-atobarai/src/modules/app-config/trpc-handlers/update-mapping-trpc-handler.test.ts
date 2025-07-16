import { mockedAuthData } from "@saleor/apl-dynamo/src/apl/mocks/mocked-auth-data";
import { BaseError } from "@saleor/errors";
import { err, ok } from "neverthrow";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { mockedAppConfigRepo } from "@/__tests__/mocks/app-config/mocked-app-config-repo";
import { mockedConfigurationId } from "@/__tests__/mocks/app-config/mocked-config-id";
import { mockedGraphqlClient } from "@/__tests__/mocks/graphql-client";
import { mockedSaleorApiUrl } from "@/__tests__/mocks/saleor/mocked-saleor-api-url";
import { mockedSaleorAppId } from "@/__tests__/mocks/saleor/mocked-saleor-app-id";
import { mockedSaleorChannelId } from "@/__tests__/mocks/saleor/mocked-saleor-channel-id";
import { TEST_Procedure } from "@/__tests__/trpc-testing-procedure";
import { UpdateMappingTrpcHandler } from "@/modules/app-config/trpc-handlers/update-mapping-trpc-handler";
import { router } from "@/modules/trpc/trpc-server";

/**
 * TODO: Probably create some test abstraction to bootstrap trpc handler for testing
 */
const getTestCaller = () => {
  const instance = new UpdateMappingTrpcHandler();

  // @ts-expect-error - context doesnt match but its applied in test
  instance.baseProcedure = TEST_Procedure;

  const testRouter = router({
    testProcedure: instance.getTrpcProcedure(),
  });

  return {
    mockedAppConfigRepo,
    caller: testRouter.createCaller({
      appId: mockedSaleorAppId,
      saleorApiUrl: mockedSaleorApiUrl,
      token: mockedAuthData.token,
      configRepo: mockedAppConfigRepo,
      apiClient: mockedGraphqlClient,
      appUrl: "https://localhost:3000",
    }),
  };
};

describe("UpdateMappingTrpcHandler", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("Returns error 500 if repository fails to save config", async () => {
    const { caller, mockedAppConfigRepo } = getTestCaller();

    vi.spyOn(mockedAppConfigRepo, "updateMapping").mockImplementationOnce(async () =>
      err(new BaseError("TEST")),
    );

    return expect(() =>
      caller.testProcedure({
        configId: mockedConfigurationId,
        channelId: mockedSaleorChannelId,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: Failed to create Stripe configuration. Data can't be saved.]`,
    );
  });

  it("Calls repository to save updated mapping", async () => {
    const { caller, mockedAppConfigRepo } = getTestCaller();

    vi.spyOn(mockedAppConfigRepo, "updateMapping").mockImplementationOnce(async () => ok(null));

    await caller.testProcedure({
      configId: mockedConfigurationId,
      channelId: mockedSaleorChannelId,
    });

    expect(vi.mocked(mockedAppConfigRepo.updateMapping).mock.calls[0]).toMatchInlineSnapshot(`
      [
        {
          "appId": "mocked-saleor-app-id",
          "saleorApiUrl": "https://mocked.saleor.api/graphql/",
        },
        {
          "channelId": "mocked-saleor-channel-id",
          "configId": "0036a39f-b66c-41a6-9e39-cc34b86093f0",
        },
      ]
    `);
  });
});
