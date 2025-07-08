import { err, ok } from "neverthrow";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { mockedAppConfigRepo } from "@/__tests__/mocks/app-config-repo";
import {
  mockedAppToken,
  mockedConfigurationId,
  mockedSaleorAppId,
  mockedSaleorChannelId,
} from "@/__tests__/mocks/constants";
import { mockedGraphqlClient } from "@/__tests__/mocks/graphql-client";
import { mockedStripeConfig } from "@/__tests__/mocks/mock-stripe-config";
import { mockedSaleorApiUrl } from "@/__tests__/mocks/saleor-api-url";
import { TEST_Procedure } from "@/__tests__/trpc-testing-procedure";
import { BaseError } from "@/lib/errors";
import { AppRootConfig } from "@/modules/app-config/domain/app-root-config";
import { RemoveStripeConfigTrpcHandler } from "@/modules/app-config/trpc-handlers/remove-stripe-config-trpc-handler";
import {
  StripeWebhookManager,
  StripeWebhookManagerErrors,
} from "@/modules/stripe/stripe-webhook-manager";
import { router } from "@/modules/trpc/trpc-server";

/**
 * TODO: Probably create some test abstraction to bootstrap trpc handler for testing
 */
const getTestCaller = () => {
  const webhookManager = new StripeWebhookManager();

  vi.spyOn(webhookManager, "removeWebhook").mockImplementation(async () => ok(null));

  const instance = new RemoveStripeConfigTrpcHandler({
    webhookManager,
  });

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
    webhookManager,
    caller: testRouter.createCaller({
      appId: mockedSaleorAppId,
      saleorApiUrl: mockedSaleorApiUrl,
      token: mockedAppToken,
      configRepo: mockedAppConfigRepo,
      apiClient: mockedGraphqlClient,
      appUrl: "https://localhost:3000",
    }),
  };
};

const getMockedRootConfig = () =>
  new AppRootConfig(
    {
      [mockedSaleorChannelId]: mockedConfigurationId,
    },
    {
      [mockedConfigurationId]: mockedStripeConfig,
    },
  );

describe("RemoveStripeConfigTrpcHandler", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("Returns NOT FOUND if config supposed to be deleted is actually gone", async () => {
    const { caller, mockedAppConfigRepo } = getTestCaller();

    vi.spyOn(mockedAppConfigRepo, "getRootConfig").mockImplementationOnce(async () =>
      ok(
        // Set empty config to simulate config is gone
        new AppRootConfig({}, {}),
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

  it("Calls webhook manager to remove webhook", async () => {
    const { caller, webhookManager } = getTestCaller();

    vi.mocked(webhookManager.removeWebhook).mockImplementationOnce(async () => ok(null));

    await expect(caller.testProcedure({ configId: mockedConfigurationId })).resolves.not.toThrow();

    expect(webhookManager.removeWebhook).toHaveBeenCalledWith({
      webhookId: mockedStripeConfig.webhookId,
      restrictedKey: mockedStripeConfig.restrictedKey,
    });
  });

  it("Calls all required services when everything is smooth", async () => {
    const { caller, mockedAppConfigRepo } = getTestCaller();

    await expect(caller.testProcedure({ configId: mockedConfigurationId })).resolves.not.toThrow();

    expect(mockedAppConfigRepo.updateMapping).toHaveBeenCalledWith(
      {
        appId: "saleor-app-id",
        saleorApiUrl: "https://foo.bar.saleor.cloud/graphql/",
      },
      {
        channelId: "Q2hhbm5lbDox",
        configId: null,
      },
    );
    expect(mockedAppConfigRepo.removeConfig).toHaveBeenCalledWith(
      {
        appId: "saleor-app-id",
        saleorApiUrl: "https://foo.bar.saleor.cloud/graphql/",
      },
      {
        configId: "81f323bd-91e2-4838-ab6e-5affd81ffc3b",
      },
    );
  });

  /**
   * Removing webhook may fail, e.g. webhook may be missing or it was removed previously.
   * We should not block this operation, use should be able to retry
   */
  it("Continue to remove config even if removing webhook fails", async () => {
    const { caller, webhookManager, mockedAppConfigRepo } = getTestCaller();

    vi.mocked(webhookManager.removeWebhook).mockImplementationOnce(async () =>
      err(new StripeWebhookManagerErrors.CantCreateWebhookError("Test error")),
    );

    await expect(caller.testProcedure({ configId: mockedConfigurationId })).resolves.not.toThrow();

    expect(mockedAppConfigRepo.updateMapping).toHaveBeenCalledWith(
      {
        appId: "saleor-app-id",
        saleorApiUrl: "https://foo.bar.saleor.cloud/graphql/",
      },
      {
        channelId: "Q2hhbm5lbDox",
        configId: null,
      },
    );
    expect(mockedAppConfigRepo.removeConfig).toHaveBeenCalledWith(
      {
        appId: "saleor-app-id",
        saleorApiUrl: "https://foo.bar.saleor.cloud/graphql/",
      },
      {
        configId: "81f323bd-91e2-4838-ab6e-5affd81ffc3b",
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

  it("Returns internal server error if config failed to update: stripe config unit", async () => {
    const { caller, mockedAppConfigRepo } = getTestCaller();

    vi.spyOn(mockedAppConfigRepo, "removeConfig").mockImplementationOnce(async () =>
      err(new BaseError("TEST")),
    );

    await expect(
      caller.testProcedure({ configId: mockedConfigurationId }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: Failed to remove Stripe configuration. Please try again.]`,
    );
  });
});
