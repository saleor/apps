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
  beforeEach(() => {
    vi.useFakeTimers();
  });

  describe("getConfig", () => {
    it("returns configuration without errors", async () => {
      const metadataManager = new MockSettingsManager();

      vi.spyOn(metadataManager, "get").mockResolvedValue('{"key": "value"}');

      const instance = new SmtpMetadataManager(metadataManager, SALEOR_API_URL);
      const result = await instance.getConfig().unwrapOr("error");

      expect(result).toEqual({ key: "value" });
    });

    it("raises error when pulling configuration exceeds the timeout", async () => {
      const metadataManager = new MockSettingsManager();

      vi.spyOn(metadataManager, "get").mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 15000)),
      );

      const instance = new SmtpMetadataManager(metadataManager, SALEOR_API_URL);
      const promise = instance.getConfig();

      await vi.advanceTimersByTimeAsync(3000);
      const result = await promise;

      const error = result._unsafeUnwrapErr();

      expect(error).toBeInstanceOf(SmtpMetadataManager.TimeoutExceededError);
    });
  });
});
