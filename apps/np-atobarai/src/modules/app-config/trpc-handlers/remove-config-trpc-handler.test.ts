import { GenericRootConfig } from "@saleor/dynamo-config-repository";
import { BaseError } from "@saleor/errors";
import { err, ok } from "neverthrow";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { mockedAppChannelConfig } from "@/__tests__/mocks/app-config/mocked-app-config";
import { mockedAppConfigRepo } from "@/__tests__/mocks/app-config/mocked-app-config-repo";
import { mockedConfigurationId } from "@/__tests__/mocks/app-config/mocked-config-id";
import { mockedGraphqlClient } from "@/__tests__/mocks/graphql-client";
import { mockAuthData } from "@/__tests__/mocks/saleor/mocked-auth-data";
import { mockedSaleorApiUrl } from "@/__tests__/mocks/saleor/mocked-saleor-api-url";
import { mockedSaleorAppId } from "@/__tests__/mocks/saleor/mocked-saleor-app-id";
import { mockedSaleorChannelId } from "@/__tests__/mocks/saleor/mocked-saleor-channel-id";
import { TEST_Procedure } from "@/__tests__/trpc-testing-procedure";
import { RemoveConfigTrpcHandler } from "@/modules/app-config/trpc-handlers/remove-config-trpc-handler";
import { router } from "@/modules/trpc/trpc-server";

/**
 * TODO: Probably create some test abstraction to bootstrap trpc handler for testing
 */
const getTestCaller = () => {
  const instance = new RemoveConfigTrpcHandler();

  // @ts-expect-error - context doesnt match but its applied in test
  instance.baseProcedure = TEST_Procedure;

  const testRouter = router({
    testProcedure: instance.getTrpcProcedure(),
  });

  vi.spyOn(mockedAppConfigRepo, "getRootConfig").mockImplementation(async () =>
    ok(getMockedRootConfig()),
  );
  vi.spyOn(mockedAppConfigRepo, "updateMapping").mockImplementation(async () => ok(null));
  vi.spyOn(mockedAppConfigRepo, "removeConfig").mockImplementation(async () => ok(null));

  return {
    mockedAppConfigRepo,
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

const getMockedRootConfig = () =>
  new GenericRootConfig({
    configsById: {
      [mockedConfigurationId]: mockedAppChannelConfig,
    },
    chanelConfigMapping: {
      [mockedSaleorChannelId]: mockedConfigurationId,
    },
  });

describe("RemoveConfigTrpcHandler", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("Returns NOT FOUND if config supposed to be deleted is actually gone", async () => {
    const { caller, mockedAppConfigRepo } = getTestCaller();

    vi.spyOn(mockedAppConfigRepo, "getRootConfig").mockImplementationOnce(async () =>
      ok(
        // Set empty config to simulate config is gone
        new GenericRootConfig({
          chanelConfigMapping: {},
          configsById: {},
        }),
      ),
    );

    return expect(() =>
      caller.testProcedure({
        configId: mockedConfigurationId,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: Config not found, please refresh the page and try again.]`,
    );
  });

  it("Calls all required services when everything is smooth", async () => {
    const { caller, mockedAppConfigRepo } = getTestCaller();

    await expect(caller.testProcedure({ configId: mockedConfigurationId })).resolves.not.toThrow();

    expect(mockedAppConfigRepo.updateMapping).toHaveBeenCalledWith(
      {
        appId: "mocked-saleor-app-id",
        saleorApiUrl: "https://mocked.saleor.api/graphql/",
      },
      {
        channelId: "mocked-saleor-channel-id",
        configId: null,
      },
    );
    expect(mockedAppConfigRepo.removeConfig).toHaveBeenCalledWith(
      {
        appId: "mocked-saleor-app-id",
        saleorApiUrl: "https://mocked.saleor.api/graphql/",
      },
      {
        configId: "0036a39f-b66c-41a6-9e39-cc34b86093f0",
      },
    );
  });

  it("Returns internal server error if config failed to update: mapping", async () => {
    const { caller, mockedAppConfigRepo } = getTestCaller();

    vi.spyOn(mockedAppConfigRepo, "updateMapping").mockImplementationOnce(async () =>
      err(new BaseError("TEST")),
    );

    await expect(
      caller.testProcedure({ configId: mockedConfigurationId }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: Failed to update channel config mapping. Please try again.]`,
    );
  });

  it("Returns internal server error if config failed to update: config unit", async () => {
    const { caller, mockedAppConfigRepo } = getTestCaller();

    vi.spyOn(mockedAppConfigRepo, "removeConfig").mockImplementationOnce(async () =>
      err(new BaseError("TEST")),
    );

    await expect(
      caller.testProcedure({ configId: mockedConfigurationId }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: Failed to remove configuration. Please try again.]`,
    );
  });
});
