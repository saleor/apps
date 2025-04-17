import fs from "node:fs";

import { afterEach, describe, expect, it, vi } from "vitest";

import { mockedConfigurationId } from "@/__tests__/mocks/constants";
import { mockedStripePublishableKey } from "@/__tests__/mocks/mocked-stripe-publishable-key";
import { mockedStripeRestrictedKey } from "@/__tests__/mocks/mocked-stripe-restricted-key";
import { mockedSaleorApiUrl } from "@/__tests__/mocks/saleor-api-url";
import { mockStripeWebhookSecret } from "@/__tests__/mocks/stripe-webhook-secret";
import {
  FileAppConfigRepo,
  FileAppConfigRepoSchema,
} from "@/modules/app-config/file-app-config-repo";
import { StripeConfig } from "@/modules/app-config/stripe-config";

vi.mock("node:fs");

describe("FileAppConfigRepo", () => {
  const TEST_FILE_PATH = ".stripe-app-config.json";
  const TEST_CHANNEL_ID = "test-channel";
  const TEST_APP_ID = "test-app";

  const mockStripeConfig = StripeConfig.create({
    name: "Test Config",
    id: mockedConfigurationId,
    restrictedKey: mockedStripeRestrictedKey,
    publishableKey: mockedStripePublishableKey,
    webhookSecret: mockStripeWebhookSecret,
  })._unsafeUnwrap();

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("saveStripeConfig", () => {
    it("should create new config file if it doesn't exist", async () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);
      vi.mocked(fs.writeFileSync).mockImplementation(() => undefined);

      const configRepo = new FileAppConfigRepo();
      const result = await configRepo.saveStripeConfig({
        channelId: TEST_CHANNEL_ID,
        config: mockStripeConfig,
        saleorApiUrl: mockedSaleorApiUrl,
        appId: TEST_APP_ID,
      });

      expect(result.isOk()).toBe(true);
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        TEST_FILE_PATH,
        expect.stringContaining(TEST_CHANNEL_ID),
        "utf-8",
      );
    });

    it("should update existing config file", async () => {
      const existingConfig: FileAppConfigRepoSchema = {
        appRootConfig: {
          "existing-channel": {
            name: "Existing Config",
            id: "existing-id",
            restrictedKey: "rk_existing",
            publishableKey: "pk_existing",
            webhookSecret: "TEST_SECRET",
          },
        },
      };

      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(existingConfig));
      vi.mocked(fs.writeFileSync).mockImplementation(() => undefined);

      const configRepo = new FileAppConfigRepo();

      const result = await configRepo.saveStripeConfig({
        channelId: TEST_CHANNEL_ID,
        config: mockStripeConfig,
        saleorApiUrl: mockedSaleorApiUrl,
        appId: TEST_APP_ID,
      });

      expect(result.isOk()).toBe(true);
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        TEST_FILE_PATH,
        expect.stringContaining("existing-channel"),
        "utf-8",
      );
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        TEST_FILE_PATH,
        expect.stringContaining(TEST_CHANNEL_ID),
        "utf-8",
      );
    });
  });

  describe("getStripeConfig", () => {
    it("should retrieve existing config", async () => {
      const existingConfig: FileAppConfigRepoSchema = {
        appRootConfig: {
          [TEST_CHANNEL_ID]: {
            name: mockStripeConfig.name,
            id: mockStripeConfig.id,
            restrictedKey: mockStripeConfig.restrictedKey,
            publishableKey: mockStripeConfig.publishableKey,
            webhookSecret: mockStripeConfig.webhookSecret,
          },
        },
      };

      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(existingConfig));

      const configRepo = new FileAppConfigRepo();
      const result = await configRepo.getStripeConfig({
        configId: mockedConfigurationId,
        saleorApiUrl: mockedSaleorApiUrl,
        appId: TEST_APP_ID,
      });

      expect(result.isOk()).toBe(true);
      const config = result._unsafeUnwrap();

      expect(config).not.toBeNull();

      expect(config!.name).toBe(mockStripeConfig.name);
      expect(config!.id).toBe(mockStripeConfig.id);
      expect(config!.publishableKey).toStrictEqual(mockedStripePublishableKey);
      expect(config!.restrictedKey).toStrictEqual(mockedStripeRestrictedKey);
    });

    it("should return null if channel config is missing", async () => {
      const existingConfig: FileAppConfigRepoSchema = {
        appRootConfig: {},
      };

      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(existingConfig));

      const configRepo = new FileAppConfigRepo();
      const result = await configRepo.getStripeConfig({
        configId: mockedConfigurationId,
        saleorApiUrl: mockedSaleorApiUrl,
        appId: TEST_APP_ID,
      });

      expect(result.isOk()).toBe(true);
      expect(result._unsafeUnwrap()).toBeNull();
    });

    it("should create file with empty config if file is not present", async () => {
      vi.mocked(fs.readFileSync).mockImplementation(() => {
        throw new Error("File not found");
      });

      const configRepo = new FileAppConfigRepo();
      const result = await configRepo.getStripeConfig({
        configId: mockedConfigurationId,
        saleorApiUrl: mockedSaleorApiUrl,
        appId: TEST_APP_ID,
      });

      expect(result.isOk()).toBe(true);

      expect(result._unsafeUnwrap()).toBeNull();

      expect(fs.writeFileSync).toHaveBeenCalledWith(
        TEST_FILE_PATH,
        expect.stringContaining("appRootConfig"),
        "utf-8",
      );
    });
  });
});
