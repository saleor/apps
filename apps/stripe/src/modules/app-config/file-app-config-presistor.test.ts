import fs from "node:fs";

import { afterEach, describe, expect, it, vi } from "vitest";

import { FileAppConfigPresistor } from "@/modules/app-config/file-app-config-presistor";
import { StripeConfig } from "@/modules/app-config/stripe-config";
import { StripePublishableKey } from "@/modules/stripe/stripe-publishable-key";
import { StripeRestrictedKey } from "@/modules/stripe/stripe-restricted-key";

vi.mock("node:fs");

describe("FileAppConfigPresistor", () => {
  const TEST_FILE_PATH = ".test-stripe-app-config.json";
  const TEST_CHANNEL_ID = "test-channel";
  const TEST_APP_ID = "test-app";
  const TEST_API_URL = "https://example.com/graphql/";

  const mockStripeConfig = StripeConfig.createFromPersistedData({
    configName: "Test Config",
    configId: "test-config-id",
    restrictedKeyValue: "rk_test_1234567890",
    publishableKeyValue: "pk_test_1234567890",
  })._unsafeUnwrap();

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("persistStripeConfig", () => {
    it("should create new config file if it doesn't exist", async () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);
      vi.mocked(fs.writeFileSync).mockImplementation(() => undefined);

      const persistor = new FileAppConfigPresistor({ filePath: TEST_FILE_PATH });
      const result = await persistor.persistStripeConfig({
        channelId: TEST_CHANNEL_ID,
        config: mockStripeConfig,
        saleorApiUrl: TEST_API_URL,
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
      const existingConfig = {
        appConfig: {
          "existing-channel": {
            name: "Existing Config",
            id: "existing-id",
            restrictedKey: "rk_existing",
            publishableKey: "pk_existing",
          },
        },
      };

      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(existingConfig));
      vi.mocked(fs.writeFileSync).mockImplementation(() => undefined);

      const persistor = new FileAppConfigPresistor({ filePath: TEST_FILE_PATH });
      const result = await persistor.persistStripeConfig({
        channelId: TEST_CHANNEL_ID,
        config: mockStripeConfig,
        saleorApiUrl: TEST_API_URL,
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

      const persistor = new FileAppConfigPresistor({ filePath: TEST_FILE_PATH });
      const result = await persistor.persistStripeConfig({
        channelId: TEST_CHANNEL_ID,
        config: mockStripeConfig,
        saleorApiUrl: TEST_API_URL,
        appId: TEST_APP_ID,
      });

      expect(result.isErr()).toBe(true);
      expect(result._unsafeUnwrapErr()).toBeInstanceOf(FileAppConfigPresistor.FileWriteError);
    });
  });

  describe("retrieveStripeConfig", () => {
    it("should retrieve existing config", async () => {
      const existingConfig = {
        appConfig: {
          [TEST_CHANNEL_ID]: {
            name: mockStripeConfig.getConfigName(),
            id: mockStripeConfig.getConfigId(),
            restrictedKey: mockStripeConfig.getRestrictedKey().getKeyValue(),
            publishableKey: mockStripeConfig.getPublishableKey().getKeyValue(),
          },
        },
      };

      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(existingConfig));

      const persistor = new FileAppConfigPresistor({ filePath: TEST_FILE_PATH });
      const result = await persistor.retrieveStripeConfig({
        channelId: TEST_CHANNEL_ID,
        saleorApiUrl: TEST_API_URL,
        appId: TEST_APP_ID,
      });

      expect(result.isOk()).toBe(true);
      const config = result._unsafeUnwrap();

      expect(config.getConfigName()).toBe(mockStripeConfig.getConfigName());
      expect(config.getConfigId()).toBe(mockStripeConfig.getConfigId());
      expect(config.getPublishableKey()).toBeInstanceOf(StripePublishableKey);
      expect(config.getRestrictedKey()).toBeInstanceOf(StripeRestrictedKey);
    });

    it("should handle missing channel config", async () => {
      const existingConfig = {
        appConfig: {},
      };

      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(existingConfig));

      const persistor = new FileAppConfigPresistor({ filePath: TEST_FILE_PATH });
      const result = await persistor.retrieveStripeConfig({
        channelId: TEST_CHANNEL_ID,
        saleorApiUrl: TEST_API_URL,
        appId: TEST_APP_ID,
      });

      expect(result.isErr()).toBe(true);
      expect(result._unsafeUnwrapErr()).toBeInstanceOf(FileAppConfigPresistor.ConfigNotFoudError);
    });

    it("should handle invalid JSON", async () => {
      vi.mocked(fs.readFileSync).mockReturnValue("invalid json");

      const persistor = new FileAppConfigPresistor({ filePath: TEST_FILE_PATH });
      const result = await persistor.retrieveStripeConfig({
        channelId: TEST_CHANNEL_ID,
        saleorApiUrl: TEST_API_URL,
        appId: TEST_APP_ID,
      });

      expect(result.isErr()).toBe(true);
      expect(result._unsafeUnwrapErr()).toBeInstanceOf(FileAppConfigPresistor.JsonParseError);
    });

    it("should handle read errors", async () => {
      vi.mocked(fs.readFileSync).mockImplementation(() => {
        throw new Error("Read error");
      });

      const persistor = new FileAppConfigPresistor({ filePath: TEST_FILE_PATH });
      const result = await persistor.retrieveStripeConfig({
        channelId: TEST_CHANNEL_ID,
        saleorApiUrl: TEST_API_URL,
        appId: TEST_APP_ID,
      });

      expect(result.isErr()).toBe(true);
      expect(result._unsafeUnwrapErr()).toBeInstanceOf(FileAppConfigPresistor.FileReadError);
    });
  });
});
