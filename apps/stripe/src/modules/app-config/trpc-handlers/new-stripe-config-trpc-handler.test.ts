import { err, ok } from "neverthrow";
import Stripe from "stripe";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { mockedAppConfigRepo } from "@/__tests__/mocks/app-config-repo";
import {
  mockedAppToken,
  mockedSaleorAppId,
  mockedSaleorChannelId,
} from "@/__tests__/mocks/constants";
import { mockedGraphqlClient } from "@/__tests__/mocks/graphql-client";
import { mockedStripePublishableKey } from "@/__tests__/mocks/mocked-stripe-publishable-key";
import { mockedStripeRestrictedKey } from "@/__tests__/mocks/mocked-stripe-restricted-key";
import { mockedSaleorApiUrl } from "@/__tests__/mocks/saleor-api-url";
import { TEST_Procedure } from "@/__tests__/trpc-testing-procedure";
import { BaseError } from "@/lib/errors";
import { NewStripeConfigTrpcHandler } from "@/modules/app-config/trpc-handlers/new-stripe-config-trpc-handler";
import { StripeClient } from "@/modules/stripe/stripe-client";
import { router } from "@/modules/trpc/trpc-server";

/**
 * TODO: Probably create some test abstraction to bootstrap trpc handler for testing
 */
const getTestCaller = () => {
  const instance = new NewStripeConfigTrpcHandler();

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
        channelId: mockedSaleorChannelId,
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
        channelId: mockedSaleorChannelId,
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
        channelId: mockedSaleorChannelId,
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
        "channelId": "Q2hhbm5lbDox",
        "config": {
          "id": Any<String>,
          "name": "Test config",
          "publishableKey": "pk_live_1",
          "restrictedKey": "rk_live_AAAAABBBBCCCCCEEEEEEEFFFFFGGGGG",
          "webhookSecret": "whsec_TODO",
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
          channelId: mockedSaleorChannelId,
        }),
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `[TRPCError: Failed to create Stripe configuration. Restricted key is invalid]`,
      );

      expect(stripe.paymentIntents.list).toHaveBeenCalledOnce();
    });
  });
});
