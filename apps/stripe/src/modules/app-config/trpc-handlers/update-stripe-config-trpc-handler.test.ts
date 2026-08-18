import { err, ok } from "neverthrow";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { mockedAppConfigRepo } from "@/__tests__/mocks/app-config-repo";
import {
  mockedAppToken,
  mockedConfigurationId,
  mockedSaleorAppId,
} from "@/__tests__/mocks/constants";
import { mockedGraphqlClient } from "@/__tests__/mocks/graphql-client";
import { mockedStripeConfig } from "@/__tests__/mocks/mock-stripe-config";
import {
  mockedStripePublishableKey,
  mockedStripePublishableKeyTest,
} from "@/__tests__/mocks/mocked-stripe-publishable-key";
import {
  mockedStripeRestrictedKey,
  mockedStripeRestrictedKeyTest,
} from "@/__tests__/mocks/mocked-stripe-restricted-key";
import { mockedSaleorApiUrl } from "@/__tests__/mocks/saleor-api-url";
import { mockStripeWebhookSecret } from "@/__tests__/mocks/stripe-webhook-secret";
import { TEST_Procedure } from "@/__tests__/trpc-testing-procedure";
import { BaseError } from "@/lib/errors";
import { AppRootConfig } from "@/modules/app-config/domain/app-root-config";
import { UpdateStripeConfigTrpcHandler } from "@/modules/app-config/trpc-handlers/update-stripe-config-trpc-handler";
import { StripeAuthValidator } from "@/modules/stripe/stripe-auth-validator";
import { StripeWebhookManager } from "@/modules/stripe/stripe-webhook-manager";
import { router } from "@/modules/trpc/trpc-server";

vi.mock("next/server", () => ({
  after: (callback: () => unknown) => callback(),
}));

vi.mock("@/lib/graphql-client", () => ({
  createInstrumentedGraphqlClient: () => ({}),
}));

const clearProblemsForConfig = vi.hoisted(() => vi.fn());

vi.mock("@/modules/app-problems/stripe-problem-reporter", () => ({
  StripeProblemReporter: class {
    clearProblemsForConfig = clearProblemsForConfig;
  },
}));

const getTestCaller = () => {
  const webhookManager = new StripeWebhookManager();
  const instance = new UpdateStripeConfigTrpcHandler({ webhookManager });

  // @ts-expect-error - context doesnt match but its applied in test
  instance.baseProcedure = TEST_Procedure;

  const testRouter = router({
    testProcedure: instance.getTrpcProcedure(),
  });

  return {
    webhookManager,
    mockedAppConfigRepo,
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

const validInput = {
  configId: mockedConfigurationId,
  name: "Renamed config",
  publishableKey: mockedStripePublishableKey,
  restrictedKey: null,
};

const mockExistingConfig = () => {
  vi.mocked(mockedAppConfigRepo.getRootConfig).mockResolvedValue(
    ok(new AppRootConfig({}, { [mockedConfigurationId]: mockedStripeConfig })),
  );
  vi.mocked(mockedAppConfigRepo.saveStripeConfig).mockResolvedValue(ok(null));
};

describe("UpdateStripeConfigTrpcHandler", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockExistingConfig();
  });

  it("Returns 404 when config does not exist", async () => {
    const { caller } = getTestCaller();

    vi.mocked(mockedAppConfigRepo.getRootConfig).mockResolvedValue(ok(new AppRootConfig({}, {})));

    return expect(() =>
      caller.testProcedure(validInput),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: Config not found, please refresh the page and try again.]`,
    );
  });

  describe("renaming only", () => {
    it("Saves the new name, keeping keys and webhook untouched", async () => {
      const { caller, webhookManager } = getTestCaller();
      const createWebhook = vi.spyOn(webhookManager, "createWebhook");
      const updateDescription = vi
        .spyOn(webhookManager, "updateWebhookDescription")
        .mockResolvedValue(ok(null));

      await caller.testProcedure(validInput);

      const savedConfig = vi.mocked(mockedAppConfigRepo.saveStripeConfig).mock.calls[0][0].config;

      expect(savedConfig.name).toBe("Renamed config");
      expect(savedConfig.id).toBe(mockedConfigurationId);
      expect(savedConfig.restrictedKey).toBe(mockedStripeRestrictedKey);
      expect(savedConfig.webhookId).toBe(mockedStripeConfig.webhookId);
      expect(savedConfig.webhookSecret).toBe(mockedStripeConfig.webhookSecret);
      expect(createWebhook).not.toHaveBeenCalled();
      expect(updateDescription).toHaveBeenCalledWith({
        webhookId: mockedStripeConfig.webhookId,
        restrictedKey: mockedStripeRestrictedKey,
        configName: "Renamed config",
      });
      expect(clearProblemsForConfig).not.toHaveBeenCalled();
    });

    it("Returns 500 when config cannot be saved", async () => {
      const { caller } = getTestCaller();

      vi.mocked(mockedAppConfigRepo.saveStripeConfig).mockResolvedValue(err(new BaseError("TEST")));

      return expect(() =>
        caller.testProcedure(validInput),
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `[TRPCError: Failed to update Stripe configuration. Data can't be saved.]`,
      );
    });
  });

  describe("rotating the restricted key", () => {
    const rotatedKey = "rk_live_rotated";

    it("Keeps the existing webhook when the new key can reach it", async () => {
      const { caller, webhookManager } = getTestCaller();

      vi.spyOn(StripeAuthValidator.prototype, "validateStripeAuth").mockResolvedValue(ok(null));

      const isReachable = vi
        .spyOn(webhookManager, "isWebhookReachableWithKey")
        .mockResolvedValue(ok(true));
      const createWebhook = vi.spyOn(webhookManager, "createWebhook");
      const removeWebhook = vi.spyOn(webhookManager, "removeWebhook");

      await caller.testProcedure({ ...validInput, name: "config-name", restrictedKey: rotatedKey });

      const savedConfig = vi.mocked(mockedAppConfigRepo.saveStripeConfig).mock.calls[0][0].config;

      expect(isReachable).toHaveBeenCalledWith({
        webhookId: mockedStripeConfig.webhookId,
        restrictedKey: rotatedKey,
      });
      expect(savedConfig.restrictedKey).toBe(rotatedKey);
      expect(savedConfig.webhookId).toBe(mockedStripeConfig.webhookId);
      expect(createWebhook).not.toHaveBeenCalled();
      expect(removeWebhook).not.toHaveBeenCalled();
      expect(clearProblemsForConfig).toHaveBeenCalledWith(mockedConfigurationId);
    });

    it("Recreates the webhook when the key points to another Stripe account", async () => {
      const { caller, webhookManager } = getTestCaller();

      vi.spyOn(StripeAuthValidator.prototype, "validateStripeAuth").mockResolvedValue(ok(null));
      vi.spyOn(webhookManager, "isWebhookReachableWithKey").mockResolvedValue(ok(false));

      const createWebhook = vi.spyOn(webhookManager, "createWebhook").mockResolvedValue(
        ok({
          id: "wh_new",
          secret: mockStripeWebhookSecret,
        }),
      );
      const removeWebhook = vi.spyOn(webhookManager, "removeWebhook").mockResolvedValue(ok(null));

      await caller.testProcedure({ ...validInput, name: "config-name", restrictedKey: rotatedKey });

      const savedConfig = vi.mocked(mockedAppConfigRepo.saveStripeConfig).mock.calls[0][0].config;

      expect(createWebhook).toHaveBeenCalledOnce();
      expect(savedConfig.webhookId).toBe("wh_new");
      expect(savedConfig.webhookSecret).toBe(mockStripeWebhookSecret);
      expect(removeWebhook).toHaveBeenCalledWith({
        webhookId: mockedStripeConfig.webhookId,
        restrictedKey: mockedStripeRestrictedKey,
      });
    });

    it("Does not touch the config when the new restricted key is invalid", async () => {
      const { caller } = getTestCaller();

      vi.spyOn(StripeAuthValidator.prototype, "validateStripeAuth").mockResolvedValue(
        err(new StripeAuthValidator.AuthError("TEST")),
      );

      await expect(() =>
        caller.testProcedure({ ...validInput, restrictedKey: rotatedKey }),
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `[TRPCError: Failed to update Stripe configuration. Restricted key is invalid]`,
      );

      expect(mockedAppConfigRepo.saveStripeConfig).not.toHaveBeenCalled();
    });

    it("Aborts instead of risking a duplicate webhook when Stripe cannot be reached", async () => {
      const { caller, webhookManager } = getTestCaller();

      vi.spyOn(StripeAuthValidator.prototype, "validateStripeAuth").mockResolvedValue(ok(null));
      vi.spyOn(webhookManager, "isWebhookReachableWithKey").mockResolvedValue(
        err(new BaseError("Stripe is down")),
      );

      const createWebhook = vi.spyOn(webhookManager, "createWebhook");

      await expect(() =>
        caller.testProcedure({ ...validInput, restrictedKey: rotatedKey }),
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `[TRPCError: Couldn't verify the existing Stripe webhook with the new key. Ensure the key can read and write webhook endpoints, then try again.]`,
      );

      expect(createWebhook).not.toHaveBeenCalled();
      expect(mockedAppConfigRepo.saveStripeConfig).not.toHaveBeenCalled();
    });
  });

  describe("switching environment", () => {
    it("Rejects a publishable key from another environment while the stored key is kept", async () => {
      const { caller } = getTestCaller();

      await expect(() =>
        caller.testProcedure({
          ...validInput,
          publishableKey: mockedStripePublishableKeyTest,
          restrictedKey: null,
        }),
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `[TRPCError: Publishable key belongs to a different environment than the saved restricted key. To switch between sandbox and live, provide both keys.]`,
      );

      expect(mockedAppConfigRepo.saveStripeConfig).not.toHaveBeenCalled();
    });

    it("Rejects mixed environments in the submitted pair", async () => {
      const { caller } = getTestCaller();

      await expect(() =>
        caller.testProcedure({
          ...validInput,
          publishableKey: mockedStripePublishableKeyTest,
          restrictedKey: mockedStripeRestrictedKey,
        }),
      ).rejects.toThrow(/Both Publishable and Restricted Keys must be live or test/);
    });

    it("Accepts a matching pair from the other environment and recreates the webhook", async () => {
      const { caller, webhookManager } = getTestCaller();

      vi.spyOn(StripeAuthValidator.prototype, "validateStripeAuth").mockResolvedValue(ok(null));
      vi.spyOn(webhookManager, "isWebhookReachableWithKey").mockResolvedValue(ok(false));
      vi.spyOn(webhookManager, "createWebhook").mockResolvedValue(
        ok({ id: "wh_test_new", secret: mockStripeWebhookSecret }),
      );
      vi.spyOn(webhookManager, "removeWebhook").mockResolvedValue(ok(null));

      await caller.testProcedure({
        ...validInput,
        name: "config-name",
        publishableKey: mockedStripePublishableKeyTest,
        restrictedKey: mockedStripeRestrictedKeyTest,
      });

      const savedConfig = vi.mocked(mockedAppConfigRepo.saveStripeConfig).mock.calls[0][0].config;

      expect(savedConfig.getStripeEnvValue()).toBe("TEST");
      expect(savedConfig.webhookId).toBe("wh_test_new");
    });
  });
});
