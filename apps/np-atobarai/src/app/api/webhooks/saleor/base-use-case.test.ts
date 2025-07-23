import { Logger } from "@saleor/apps-logger";
import { BaseError } from "@saleor/errors";
import { err, ok } from "neverthrow";
import { describe, expect, it, vi } from "vitest";

import { mockedAppChannelConfig } from "@/__tests__/mocks/app-config/mocked-app-config";
import { mockedAppConfigRepo } from "@/__tests__/mocks/app-config/mocked-app-config-repo";
import { mockedSaleorApiUrl } from "@/__tests__/mocks/saleor/mocked-saleor-api-url";
import { AppConfigRepo } from "@/modules/app-config/repo/app-config-repo";

import { BaseUseCase } from "./base-use-case";
import { AppIsNotConfiguredResponse } from "./saleor-webhook-responses";

// Concrete implementation for testing
class TestUseCase extends BaseUseCase {
  protected logger: Pick<Logger, "error" | "warn"> = {
    error: vi.fn(),
    warn: vi.fn(),
  };
  protected appConfigRepo: Pick<AppConfigRepo, "getChannelConfig">;

  constructor(appConfigRepo: Pick<AppConfigRepo, "getChannelConfig">) {
    super();
    this.appConfigRepo = appConfigRepo;
  }
}

describe("BaseUseCase", () => {
  describe("getAtobaraiConfigForChannel", () => {
    const testParams = {
      channelId: "test-channel-id",
      appId: "test-app-id",
      saleorApiUrl: mockedSaleorApiUrl,
    };

    it("should return configuration when successfully retrieved from repo", async () => {
      const useCase = new TestUseCase(mockedAppConfigRepo);

      vi.spyOn(mockedAppConfigRepo, "getChannelConfig").mockResolvedValue(
        ok(mockedAppChannelConfig),
      );

      const result = await useCase.getAtobaraiConfigForChannel(testParams);

      expect(result._unsafeUnwrap()).toBe(mockedAppChannelConfig);
    });

    it("should return AppIsNotConfiguredResponse when repo fails to get configuration", async () => {
      const useCase = new TestUseCase(mockedAppConfigRepo);

      vi.spyOn(mockedAppConfigRepo, "getChannelConfig").mockResolvedValue(
        err(new BaseError("Database connection failed")),
      );

      const result = await useCase.getAtobaraiConfigForChannel(testParams);

      expect(result._unsafeUnwrapErr()).toBeInstanceOf(AppIsNotConfiguredResponse);
    });

    it("should return AppIsNotConfiguredResponse when no configuration is found for channel", async () => {
      const useCase = new TestUseCase(mockedAppConfigRepo);

      vi.spyOn(mockedAppConfigRepo, "getChannelConfig").mockResolvedValue(ok(null));

      const result = await useCase.getAtobaraiConfigForChannel(testParams);

      expect(result._unsafeUnwrapErr()).toBeInstanceOf(AppIsNotConfiguredResponse);
    });
  });
});
