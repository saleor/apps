import { SettingsManager } from "@saleor/app-sdk/settings-manager";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CrudSettingsManager } from "./crud-settings.service";

describe("CrudSettingsService", () => {
  let mockSettingsManager: SettingsManager = {
    set: vi.fn(),
    get: vi.fn(),
    delete: vi.fn(),
  };

  let service: CrudSettingsManager;

  beforeEach(() => {
    mockSettingsManager = {
      set: vi.fn(),
      get: vi.fn(),
      delete: vi.fn(),
    };

    service = new CrudSettingsManager({
      metadataManager: mockSettingsManager,
      saleorApiUrl: "apiUrl",
      metadataKey: "metadataKey",
    });
  });

  describe("readAll", () => {
    it("returns an empty array if nothing found", async () => {
      const result = await service.readAll();

      expect(result).toEqual({ data: [] });
    });
    it("returns an array of settings if found", async () => {
      const encryptedValue = JSON.stringify([{ id: "id", key: "value" }]);

      vi.mocked(mockSettingsManager.get).mockImplementation(async () => {
        return encryptedValue;
      });

      const result = await service.readAll();

      expect(result).toEqual({ data: [{ id: "id", key: "value" }] });
    });
    it("throws an error if the settings are invalid", async () => {
      const encryptedValue = JSON.stringify({});

      vi.mocked(mockSettingsManager.get).mockImplementation(async () => {
        return encryptedValue;
      });

      await expect(service.readAll()).rejects.toThrowError("Error while validating metadata");
    });
  });

  describe("read", () => {
    it("throws an error if the settings are invalid", async () => {
      const encryptedValue = JSON.stringify({});

      vi.mocked(mockSettingsManager.get).mockImplementation(async () => {
        return encryptedValue;
      });

      await expect(service.readById("id")).rejects.toThrowError("Error while validating metadata");
    });

    it("throws an error if the item is not found", async () => {
      const encryptedValue = JSON.stringify([{ id: "id", key: "value" }]);

      vi.mocked(mockSettingsManager.get).mockImplementation(async () => {
        return encryptedValue;
      });

      await expect(service.readById("id2")).rejects.toThrowError("Item not found");
    });

    it("returns the item if found", async () => {
      const encryptedValue = JSON.stringify([{ id: "id", key: "value" }]);

      vi.mocked(mockSettingsManager.get).mockImplementation(async () => {
        return encryptedValue;
      });

      const result = await service.readById("id");

      expect(result).toEqual({ data: { id: "id", key: "value" } });
    });
  });

  describe("create", () => {
    it("creates a new item", async () => {
      vi.mocked(mockSettingsManager.set).mockImplementation(async () => {});

      const result = await service.create({ key: "value" });

      expect(result).toEqual({ data: { id: expect.any(String) } });
    });
  });

  describe("delete", () => {
    it("deletes an item", async () => {
      vi.mocked(mockSettingsManager.get).mockImplementation(async () => {
        return JSON.stringify([{ id: "id", key: "value" }]);
      });

      await service.delete("id");

      expect(mockSettingsManager.set).toHaveBeenCalledWith({
        domain: "apiUrl",
        key: "metadataKey",
        value: JSON.stringify([]),
      });
    });
  });

  describe("updateById", () => {
    it("partially updates an existing item", async () => {
      vi.mocked(mockSettingsManager.get).mockImplementation(async () => {
        return JSON.stringify([{ id: "id", data: [], config: { foo: "bar" } }]);
      });

      await service.updateById("id", { config: { foo: "baz" } });

      expect(mockSettingsManager.set).toHaveBeenCalledWith({
        domain: "apiUrl",
        key: "metadataKey",
        value: JSON.stringify([{ id: "id", data: [], config: { foo: "baz" } }]),
      });
    });
  });
});
