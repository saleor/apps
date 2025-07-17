import { mockedAuthData } from "@saleor/apl-dynamo/src/apl/mocks/mocked-auth-data";
import { GenericRootConfig } from "@saleor/dynamo-config-repository";
import { BaseError } from "@saleor/errors";
import { err, ok } from "neverthrow";
import { describe, expect, it, vi } from "vitest";

import { mockedAppChannelConfig } from "@/__tests__/mocks/app-config/mocked-app-config";
import { mockedAppConfigRepo } from "@/__tests__/mocks/app-config/mocked-app-config-repo";
import { mockedGraphqlClient } from "@/__tests__/mocks/graphql-client";
import { mockedSaleorApiUrl } from "@/__tests__/mocks/saleor/mocked-saleor-api-url";
import { mockedSaleorAppId } from "@/__tests__/mocks/saleor/mocked-saleor-app-id";
import { TEST_Procedure } from "@/__tests__/trpc-testing-procedure";
import { GetConfigsChannelsMappingTrpcHandler } from "@/modules/app-config/trpc-handlers/get-configs-channels-mapping-trpc-handler";
import { router } from "@/modules/trpc/trpc-server";

/**
 * TODO: Probably create some test abstraction to bootstrap trpc handler for testing
 */
const getTestCaller = () => {
  const instance = new GetConfigsChannelsMappingTrpcHandler();

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

describe("GetConfigsChannelsMappingTrpcHandler", () => {
  it("Returns error 500 if repository is down", async () => {
    const { caller, mockedAppConfigRepo } = getTestCaller();

    vi.spyOn(mockedAppConfigRepo, "getRootConfig").mockImplementationOnce(async () =>
      err(new BaseError("test")),
    );

    return expect(() => caller.testProcedure()).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: App failed to fetch config, please contact Saleor]`,
    );
  });

  it("Returns channels mapping from repository", async () => {
    const { caller, mockedAppConfigRepo } = getTestCaller();

    vi.spyOn(mockedAppConfigRepo, "getRootConfig").mockImplementationOnce(async () =>
      ok(
        new GenericRootConfig({
          chanelConfigMapping: {
            "c-id1": "id-1",
          },
          configsById: {
            "id-1": mockedAppChannelConfig,
          },
        }),
      ),
    );

    // Missing webhook status is expected - we dont have to show this field in the UI
    return expect(caller.testProcedure()).resolves.toMatchInlineSnapshot(`
      {
        "c-id1": AppChannelConfig {
          "id": "111",
          "merchantCode": "merchant-code-1",
          "name": "Config 1",
          "shippingCompanyCode": "5000",
          "skuAsName": true,
          "spCode": "sp1",
          "terminalId": "id",
          "useSandbox": true,
        },
      }
    `);
  });
});
