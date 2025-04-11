import { err, ok } from "neverthrow";
import { describe, expect, it, vi } from "vitest";

import { mockedAppConfigRepo } from "@/__tests__/mocks/app-config-repo";
import { mockedConfigurationId, mockedSaleorAppId } from "@/__tests__/mocks/constants";
import { mockedSaleorApiUrl } from "@/__tests__/mocks/saleor-api-url";
import { BaseError } from "@/lib/errors";
import { getStripeConfigTrpcHandler } from "@/modules/app-config/app-config-router";

describe("AppConfigRouter", () => {
  describe("getStripeConfigProcedure", () => {
    it("Returns serialized config if found in repo", async () => {
      const result = await getStripeConfigTrpcHandler({
        saleorApiUrl: mockedSaleorApiUrl,
        appId: mockedSaleorAppId,
        configRepo: mockedAppConfigRepo,
        configId: mockedConfigurationId,
      });

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
      vi.spyOn(mockedAppConfigRepo, "getStripeConfig").mockImplementationOnce(async () => ok(null));

      return expect(() =>
        getStripeConfigTrpcHandler({
          saleorApiUrl: mockedSaleorApiUrl,
          appId: mockedSaleorAppId,
          configRepo: mockedAppConfigRepo,
          configId: mockedConfigurationId,
        }),
      ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: Config not found]`);
    });

    it("Returns 404 if config not found", () => {
      vi.spyOn(mockedAppConfigRepo, "getStripeConfig").mockImplementationOnce(async () =>
        err(new BaseError("Test error")),
      );

      return expect(() =>
        getStripeConfigTrpcHandler({
          saleorApiUrl: mockedSaleorApiUrl,
          appId: mockedSaleorAppId,
          configRepo: mockedAppConfigRepo,
          configId: mockedConfigurationId,
        }),
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `[TRPCError: App failed to fetch config, please contact Saleor]`,
      );
    });
  });
});
