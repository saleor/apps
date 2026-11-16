import { err, ok } from "neverthrow";
import Stripe from "stripe";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { mockedAppConfigRepo } from "@/__tests__/mocks/app-config-repo";
import { mockedAppToken, mockedSaleorAppId } from "@/__tests__/mocks/constants";
import { mockedGraphqlClient } from "@/__tests__/mocks/graphql-client";
import { mockedStripeCustomersApi } from "@/__tests__/mocks/mocked-stripe-customers-api";
import { mockedStripePublishableKey } from "@/__tests__/mocks/mocked-stripe-publishable-key";
import { mockedStripeRestrictedKey } from "@/__tests__/mocks/mocked-stripe-restricted-key";
import { mockedSaleorApiUrl } from "@/__tests__/mocks/saleor-api-url";
import { mockStripeWebhookSecret } from "@/__tests__/mocks/stripe-webhook-secret";
import { TEST_Procedure } from "@/__tests__/trpc-testing-procedure";
import { BaseError } from "@/lib/errors";
import { NewStripeConfigTrpcHandler } from "@/modules/app-config/trpc-handlers/new-stripe-config-trpc-handler";
import { StripeClient } from "@/modules/stripe/stripe-client";
import { StripeWebhookManager } from "@/modules/stripe/stripe-webhook-manager";
import { router } from "@/modules/trpc/trpc-server";

const webhookCreator = new StripeWebhookManager();

/**
 * TODO: Probably create some test abstraction to bootstrap trpc handler for testing
 */
const getTestCaller = () => {
  const instance = new NewStripeConfigTrpcHandler({
    webhookManager: webhookCreator,
    customersApiFactory: { create: () => mockedStripeCustomersApi },
  });

  // @ts-expect-error - context doesnt match but its applied in test
  instance.baseProcedure = TEST_Procedure;

  const testRouter = router({
    testProcedure: instance.getTrpcProcedure(),
  });

  return {
    mockedAppConfigRepo,
    webhookCreator,
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

describe("NewStripeConfigTrpcHandler", () => {
  const stripe = new Stripe("key");

  beforeEach(() => {
    vi.resetAllMocks();

    vi.spyOn(stripe.paymentIntents, "list").mockImplementation(() => {
      return Promise.resolve({}) as Stripe.ApiListPromise<Stripe.PaymentIntent>;
    });
    vi.spyOn(StripeClient, "createFromRestrictedKey").mockImplementation(() => {
      return {
        nativeClient: stripe,
      };
    });
    vi.spyOn(webhookCreator, "createWebhook").mockImplementation(async () =>
      ok({
        id: "whid_1234",
        secret: mockStripeWebhookSecret,
      }),
    );
  });

  it("Returns error 500 if repository fails to save config", async () => {
    const { caller, mockedAppConfigRepo } = getTestCaller();

    vi.spyOn(mockedAppConfigRepo, "saveStripeConfig").mockImplementationOnce(async () =>
      err(new BaseError("TEST")),
    );

    return expect(() =>
      caller.testProcedure({
        name: "Test config",
        publishableKey: mockedStripePublishableKey,
        restrictedKey: mockedStripeRestrictedKey,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: Failed to create Stripe configuration. Data can't be saved.]`,
    );
  });

  it("Returns 404 if config is in invalid shape (model can't be created)", () => {
    const { caller, mockedAppConfigRepo } = getTestCaller();

    vi.spyOn(mockedAppConfigRepo, "saveStripeConfig").mockImplementationOnce(async () => ok(null));

    // todo expect pretty zod error with zod-validation-error
    return expect(
      caller.testProcedure({
        name: "", //empty name should throw
        publishableKey: mockedStripePublishableKey,
        restrictedKey: mockedStripeRestrictedKey,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [TRPCError: [
        {
          "code": "too_small",
          "minimum": 1,
          "type": "string",
          "inclusive": true,
          "exact": false,
          "message": "String must contain at least 1 character(s)",
          "path": [
            "name"
          ]
        }
      ]]
    `);
  });

  it("Doesn't throw if everything set properly. Config repo is called to save data", async () => {
    const { caller, mockedAppConfigRepo } = getTestCaller();

    vi.spyOn(mockedAppConfigRepo, "saveStripeConfig").mockImplementationOnce(async () => ok(null));

    await expect(
      caller.testProcedure({
        name: "Test config",
        publishableKey: mockedStripePublishableKey,
        restrictedKey: mockedStripeRestrictedKey,
      }),
    ).resolves.not.toThrow();

    const mockCallArg = vi.mocked(mockedAppConfigRepo.saveStripeConfig).mock.calls[0][0];

    expect(mockCallArg).toMatchInlineSnapshot(
      {
        config: {
          id: expect.any(String),
        },
      },
      `
      {
        "appId": "saleor-app-id",
        "config": {
          "customerCreationEnabled": false,
          "id": Any<String>,
          "name": "Test config",
          "publishableKey": "pk_live_1",
          "restrictedKey": "rk_live_AAAAABBBBCCCCCEEEEEEEFFFFFGGGGG",
          "webhookId": "whid_1234",
          "webhookSecret": "whsec_XYZ",
        },
        "saleorApiUrl": "https://foo.bar.saleor.cloud/graphql/",
      }
    `,
    );
  });

  describe("Stripe Auth", () => {
    it("Calls auth service and returns error if Stripe RK is invalid", () => {
      // @ts-expect-error - mocking stripe client
      vi.spyOn(stripe.paymentIntents, "list").mockImplementationOnce(async () => {
        throw new Error("Invalid key");
      });

      const { caller } = getTestCaller();

      return expect(() =>
        caller.testProcedure({
          name: "Test config",
          publishableKey: mockedStripePublishableKey,
          restrictedKey: mockedStripeRestrictedKey,
        }),
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `[TRPCError: Failed to create Stripe configuration. Restricted key is invalid]`,
      );

      expect(stripe.paymentIntents.list).toHaveBeenCalledOnce();
    });
  });

  describe("customer creation", () => {
    const input = {
      name: "Test config",
      publishableKey: mockedStripePublishableKey,
      restrictedKey: mockedStripeRestrictedKey,
      customerCreationEnabled: true,
    };

    it("Saves it turned on when the key can write Customers", async () => {
      const { caller, mockedAppConfigRepo } = getTestCaller();

      vi.mocked(mockedStripeCustomersApi.hasCustomersWritePermission).mockResolvedValue(ok(true));
      vi.spyOn(mockedAppConfigRepo, "saveStripeConfig").mockImplementationOnce(async () =>
        ok(null),
      );

      await caller.testProcedure(input);

      const savedConfig = vi.mocked(mockedAppConfigRepo.saveStripeConfig).mock.calls[0][0].config;

      expect(savedConfig.customerCreationEnabled).toBe(true);
    });

    it("Rejects it before creating the webhook when the key lacks Customers - Write", async () => {
      const { caller, mockedAppConfigRepo } = getTestCaller();

      vi.mocked(mockedStripeCustomersApi.hasCustomersWritePermission).mockResolvedValue(ok(false));

      await expect(caller.testProcedure(input)).rejects.toMatchObject({
        code: "PRECONDITION_FAILED",
        message: expect.stringContaining("Customers - Write"),
      });
      expect(webhookCreator.createWebhook).not.toHaveBeenCalled();
      expect(mockedAppConfigRepo.saveStripeConfig).not.toHaveBeenCalled();
    });

    it("Doesn't check the permission when it stays off", async () => {
      const { caller, mockedAppConfigRepo } = getTestCaller();

      vi.spyOn(mockedAppConfigRepo, "saveStripeConfig").mockImplementationOnce(async () =>
        ok(null),
      );

      await caller.testProcedure({ ...input, customerCreationEnabled: false });

      expect(mockedStripeCustomersApi.hasCustomersWritePermission).not.toHaveBeenCalled();
      expect(
        vi.mocked(mockedAppConfigRepo.saveStripeConfig).mock.calls[0][0].config
          .customerCreationEnabled,
      ).toBe(false);
    });
  });
});
