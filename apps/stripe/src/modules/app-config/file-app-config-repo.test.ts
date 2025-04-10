import fs from "node:fs";

import { afterEach, describe, expect, it, vi } from "vitest";

import { mockStripeWebhookSecret } from "@/__tests__/mocks/constants";
import {
  FileAppConfigRepo,
  FileAppConfigRepoSchema,
} from "@/modules/app-config/file-app-config-repo";
import { StripeConfig } from "@/modules/app-config/stripe-config";
import { SaleorApiUrl } from "@/modules/saleor/saleor-api-url";
import { StripePublishableKey } from "@/modules/stripe/stripe-publishable-key";
import { StripeRestrictedKey } from "@/modules/stripe/stripe-restricted-key";

vi.mock("node:fs");

describe("FileAppConfigRepo", () => {
  const TEST_FILE_PATH = ".stripe-app-config.json";
  const TEST_CHANNEL_ID = "test-channel";
  const TEST_APP_ID = "test-app";

  const saleorApiUrl = SaleorApiUrl.create({
    url: "https://example.com/graphql/",
  })._unsafeUnwrap();

  const restrictedKey = StripeRestrictedKey.create({
    restrictedKey: "rk_test_1234567890",
  })._unsafeUnwrap();

  const publishableKey = StripePublishableKey.create({
    publishableKey: "pk_test_1234567890",
  })._unsafeUnwrap();

  const mockStripeConfig = StripeConfig.create({
    name: "Test Config",
    id: "test-config-id",
    restrictedKey: restrictedKey,
    publishableKey: publishableKey,
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
        saleorApiUrl: saleorApiUrl,
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
        saleorApiUrl: saleorApiUrl,
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

    it("should handle write errors", async () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);
      vi.mocked(fs.writeFileSync).mockImplementation(() => {
        throw new Error("Write error");
      });

      const configRepo = new FileAppConfigRepo();
      const result = await configRepo.saveStripeConfig({
        channelId: TEST_CHANNEL_ID,
        config: mockStripeConfig,
        saleorApiUrl: saleorApiUrl,
        appId: TEST_APP_ID,
      });

      expect(result.isErr()).toBe(true);
      expect(result._unsafeUnwrapErr()).toBeInstanceOf(FileAppConfigRepo.FileWriteError);
    });
  });

  describe("getStripeConfig", () => {
    it("should retrieve existing config", async () => {
      const existingConfig: FileAppConfigRepoSchema = {
        appRootConfig: {
          [TEST_CHANNEL_ID]: {
            name: mockStripeConfig.name,
            id: mockStripeConfig.id,
            restrictedKey: mockStripeConfig.restrictedKey.keyValue,
            publishableKey: mockStripeConfig.publishableKey.keyValue,
            webhookSecret: mockStripeConfig.webhookSecret.secretValue,
          },
        },
      };

      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(existingConfig));

      const configRepo = new FileAppConfigRepo();
      const result = await configRepo.getStripeConfig({
        channelId: TEST_CHANNEL_ID,
        saleorApiUrl: saleorApiUrl,
        appId: TEST_APP_ID,
      });

      expect(result.isOk()).toBe(true);
      const config = result._unsafeUnwrap();

      expect(config).not.toBeNull();

      expect(config!.name).toBe(mockStripeConfig.name);
      expect(config!.id).toBe(mockStripeConfig.id);
      expect(config!.publishableKey).toBeInstanceOf(StripePublishableKey);
      expect(config!.restrictedKey).toBeInstanceOf(StripeRestrictedKey);
    });

    it("should return null if channel config is missing", async () => {
      const existingConfig: FileAppConfigRepoSchema = {
        appRootConfig: {},
      };

      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(existingConfig));

      const configRepo = new FileAppConfigRepo();
      const result = await configRepo.getStripeConfig({
        channelId: TEST_CHANNEL_ID,
        saleorApiUrl: saleorApiUrl,
        appId: TEST_APP_ID,
      });

      expect(result.isOk()).toBe(true);
      expect(result._unsafeUnwrap()).toBeNull();
    });

    it("should handle invalid JSON", async () => {
      vi.mocked(fs.readFileSync).mockReturnValue("invalid json");

      const configRepo = new FileAppConfigRepo();
      const result = await configRepo.getStripeConfig({
        channelId: TEST_CHANNEL_ID,
        saleorApiUrl: saleorApiUrl,
        appId: TEST_APP_ID,
      });

      expect(result.isErr()).toBe(true);
      expect(result._unsafeUnwrapErr()).toBeInstanceOf(FileAppConfigRepo.JsonParseError);
    });

    it("should handle parse errors", async () => {
      vi.mocked(fs.readFileSync).mockReturnValue("{}");

      const configRepo = new FileAppConfigRepo();
      const result = await configRepo.getStripeConfig({
        channelId: TEST_CHANNEL_ID,
        saleorApiUrl: saleorApiUrl,
        appId: TEST_APP_ID,
      });

      expect(result.isErr()).toBe(true);
      expect(result._unsafeUnwrapErr()).toBeInstanceOf(FileAppConfigRepo.SchemaParseError);
    });

    it("should create file with empty config if file is not present", async () => {
      vi.mocked(fs.readFileSync).mockImplementation(() => {
        throw new Error("File not found");
      });

      const configRepo = new FileAppConfigRepo();
      const result = await configRepo.getStripeConfig({
        channelId: TEST_CHANNEL_ID,
        saleorApiUrl: saleorApiUrl,
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
