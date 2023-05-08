import { beforeEach, describe, expect, it, vi } from "vitest";
import { ConfigV1ToV2MigrationService } from "./config-v1-to-v2-migration.service";
import { SimpleGraphqlClient } from "../metadata-manager";
import { getMockAddress } from "../../../fixtures/mock-address";
import { AppConfigV2 } from "./app-config";

describe("config-v1-to-v2-migration.service", () => {
  const mockClient: SimpleGraphqlClient = {
    mutation: vi.fn(),
    query: vi.fn(),
  };

  let service: ConfigV1ToV2MigrationService;

  beforeEach(() => {
    vi.resetAllMocks();

    service = new ConfigV1ToV2MigrationService(mockClient, "https://example.com/graphql/");

    vi.spyOn(service.configMetadataManager, "set").mockImplementationOnce(async () =>
      Promise.resolve()
    );
  });

  it("Returns a pure V2 config if V1 config is not present", async () => {
    vi.spyOn(service.metadataV1AppConfigurator, "getConfig").mockImplementationOnce(async () =>
      Promise.resolve(undefined)
    );

    const migrationResult = await service.migrate();

    expect(migrationResult.getChannelsOverrides()).toEqual({});
    expect(service.configMetadataManager.set).toHaveBeenCalledWith(migrationResult.serialize());
  });

  it("Returns a migrated V2 config from V1 if V1 config is present", async () => {
    vi.spyOn(service.metadataV1AppConfigurator, "getConfig").mockImplementationOnce(async () =>
      Promise.resolve({
        shopConfigPerChannel: {
          "default-channel": {
            address: getMockAddress(),
          },
        },
      })
    );

    const migrationResult = await service.migrate();

    expect(migrationResult.getChannelsOverrides()).toEqual(
      expect.objectContaining({
        "default-channel": expect.objectContaining(getMockAddress()),
      })
    );
  });

  it("Runs a beforeSave callback and saves modified state in metadata - missing v1 config scenario", async () => {
    vi.spyOn(service.metadataV1AppConfigurator, "getConfig").mockImplementationOnce(async () =>
      Promise.resolve(undefined)
    );

    const beforeSaveCb = vi.fn().mockImplementationOnce((config: AppConfigV2) => {
      config.upsertOverride("test", getMockAddress());
    });

    const migrationResult = await service.migrate(beforeSaveCb);

    expect(migrationResult.getChannelsOverrides()).toEqual({
      test: expect.objectContaining(getMockAddress()),
    });
    expect(service.configMetadataManager.set).toHaveBeenCalledWith(migrationResult.serialize());
    expect(beforeSaveCb).toHaveBeenCalledWith(migrationResult);
  });

  it("Runs a beforeSave callback and saves modified state in metadata - present v1 config scenario", async () => {
    vi.spyOn(service.metadataV1AppConfigurator, "getConfig").mockImplementationOnce(async () =>
      Promise.resolve({
        shopConfigPerChannel: {
          "default-channel": {
            address: getMockAddress(),
          },
        },
      })
    );

    const beforeSaveCb = vi.fn().mockImplementationOnce((config: AppConfigV2) => {
      config.removeOverride("default-channel");
    });

    const migrationResult = await service.migrate(beforeSaveCb);

    expect(migrationResult.getChannelsOverrides()).toEqual({});
    expect(service.configMetadataManager.set).toHaveBeenCalledWith(migrationResult.serialize());
    expect(beforeSaveCb).toHaveBeenCalledWith(migrationResult);
  });
});
