import { err, ok } from "neverthrow";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { mockedAppConfigRepo } from "@/__tests__/mocks/app-config-repo";
import {
  mockedAppToken,
  mockedConfigurationId,
  mockedSaleorAppId,
} from "@/__tests__/mocks/constants";
import { mockedGraphqlClient } from "@/__tests__/mocks/graphql-client";
import { mockedSaleorApiUrl } from "@/__tests__/mocks/saleor-api-url";
import { TEST_Procedure } from "@/__tests__/trpc-testing-procedure";
import { BaseError } from "@/lib/errors";
import { GetStripeConfigTrpcHandler } from "@/modules/app-config/trpc-handlers/get-stripe-config-trpc-handler";
import { router } from "@/modules/trpc/trpc-server";

const getTestCaller = () => {
  const instance = new GetStripeConfigTrpcHandler();

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
      token: mockedAppToken,
      configRepo: mockedAppConfigRepo,
      apiClient: mockedGraphqlClient,
    }),
  };
};

describe("GetStripeConfigTrpcHandler", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("Returns serialized config if found in repo", async () => {
    const { caller } = getTestCaller();

    const result = await caller.testProcedure({ configId: mockedConfigurationId });

    expect(result).toMatchInlineSnapshot(`
      StripeFrontendConfig {
        "id": "config-id",
        "name": "config-name",
        "publishableKey": "pk_live_1",
        "restrictedKey": "...ve_1",
      }
    `);
  });

  it("Returns error 500 if repository is down", async () => {
    const { caller, mockedAppConfigRepo } = getTestCaller();

    vi.spyOn(mockedAppConfigRepo, "getStripeConfig").mockImplementationOnce(async () => ok(null));

    return expect(() =>
      caller.testProcedure({ configId: mockedConfigurationId }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: Config not found]`);
  });

  it("Returns 404 if config not found", () => {
    const { caller, mockedAppConfigRepo } = getTestCaller();

    vi.spyOn(mockedAppConfigRepo, "getStripeConfig").mockImplementationOnce(async () =>
      err(new BaseError("Test error")),
    );

    return expect(() =>
      caller.testProcedure({ configId: mockedConfigurationId }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: App failed to fetch config, please contact Saleor]`,
    );
  });
});
