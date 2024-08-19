import { SettingsManager } from "@saleor/app-sdk/settings-manager";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SmtpMetadataManager } from "./smtp-metadata-manager";

const SALEOR_API_URL = "https://saleor-api.com";

class MockSettingsManager implements SettingsManager {
  get = vi.fn();
  set = vi.fn();
  delete = vi.fn();
}

describe("SmtpMetadataManager", () => {
  beforeEach(() => {});

  describe("getConfig", () => {
    it("returns configuration without errors", async () => {
      const metadataManager = new MockSettingsManager();

      vi.spyOn(metadataManager, "get").mockResolvedValue('{"key": "value"}');

      const instance = new SmtpMetadataManager(metadataManager, SALEOR_API_URL, 1000);
      const result = await instance.getConfig().unwrapOr("error");

      expect(result).toEqual({ key: "value" });
    });

    it("raises error when pulling configuration exceeds the timeout", async () => {
      const metadataManager = new MockSettingsManager();

      vi.spyOn(metadataManager, "get").mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100)),
      );

      const instance = new SmtpMetadataManager(metadataManager, SALEOR_API_URL, 50);
      const result = await instance.getConfig();
      const error = result._unsafeUnwrapErr().errors?.pop();

      expect(error).toBeInstanceOf(SmtpMetadataManager.TimeoutExceededError);
    });
  });
});
