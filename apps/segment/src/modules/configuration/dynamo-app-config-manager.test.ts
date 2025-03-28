import { err } from "neverthrow";
import { describe, expect, it, vi } from "vitest";

import { MemoryConfigRepository } from "../db/__tests__/memory-config-repository";
import { AppConfig } from "./app-config";
import { DynamoAppConfigManager } from "./dynamo-app-config-manager";

describe("DynamoAppConfigManager", () => {
  it("should get App Config from DynamoDB", async () => {
    const repository = new MemoryConfigRepository();
    const manager = DynamoAppConfigManager.create(repository);
    const config = new AppConfig({
      segmentWriteKey: "segmentWriteKey",
    });

    repository.setAppConfigEntry({
      appId: "appId",
      saleorApiUrl: "saleorApiUrl",
      configKey: manager.configKey,
      config: config,
    });

    const result = await manager.get({
      appId: "appId",
      saleorApiUrl: "saleorApiUrl",
    });

    expect(result).toBe(config);
  });

  it("should return null if App Config does not exist in DynamoDB", async () => {
    const repository = new MemoryConfigRepository();
    const manager = DynamoAppConfigManager.create(repository);

    const result = await manager.get({
      appId: "appId",
      saleorApiUrl: "saleorApiUrl",
    });

    expect(result).toBeNull();
  });

  it("should throw error if getting App Config fails", async () => {
    const repository = new MemoryConfigRepository();

    vi.spyOn(repository, "getAppConfigEntry").mockReturnValue(
      Promise.resolve(err(new DynamoAppConfigManager.GetConfigDataError("Error getting data"))),
    );
    const manager = DynamoAppConfigManager.create(repository);

    await expect(
      manager.get({ appId: "appId", saleorApiUrl: "saleorApiUrl" }),
    ).rejects.toThrowError(DynamoAppConfigManager.GetConfigDataError);
  });

  it("should set App Config in DynamoDB", async () => {
    const repository = new MemoryConfigRepository();
    const manager = DynamoAppConfigManager.create(repository);

    const config = new AppConfig({
      segmentWriteKey: "segmentWriteKey",
    });

    const result = await manager.set({
      appId: "appId",
      saleorApiUrl: "saleorApiUrl",
      config: config,
    });

    expect(result).toBeUndefined();

    const respositoryResult = await repository.getAppConfigEntry({
      appId: "appId",
      saleorApiUrl: "saleorApiUrl",
      configKey: manager.configKey,
    });

    expect(respositoryResult._unsafeUnwrap()).toBe(config);
  });

  it("should throw error if setting App Config fails", async () => {
    const repository = new MemoryConfigRepository();

    vi.spyOn(repository, "setAppConfigEntry").mockReturnValue(
      Promise.resolve(err(new DynamoAppConfigManager.SetConfigDataError("Error setting data"))),
    );
    const manager = DynamoAppConfigManager.create(repository);

    await expect(
      manager.set({
        appId: "appId",
        saleorApiUrl: "saleorApiUrl",
        config: new AppConfig({ segmentWriteKey: "segmentWriteKey" }),
      }),
    ).rejects.toThrowError(DynamoAppConfigManager.SetConfigDataError);
  });
});
