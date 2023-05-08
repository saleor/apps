import { describe, it, vi, expect, beforeEach } from "vitest";
import { GetAppConfigurationV2Service } from "./get-app-configuration.v2.service";
import { AppConfigV2 } from "./app-config";
import { getMockAddress } from "../../../fixtures/mock-address";

describe("GetAppConfigurationV2Service", function () {
  let service: GetAppConfigurationV2Service;

  beforeEach(() => {
    vi.resetAllMocks();

    service = new GetAppConfigurationV2Service({
      saleorApiUrl: "https://example.com/graphql/",
      apiClient: {
        mutation: vi.fn(),
        query: vi.fn(),
      },
    });
  });

  it("Returns parsed AppConfigV2 when metadata is found", async () => {
    vi.spyOn(service.appConfigMetadataManager, "get").mockImplementationOnce(async () => {
      const configSavedInMetadata = new AppConfigV2({
        channelsOverrides: {
          test: getMockAddress(),
        },
      }).serialize();

      return configSavedInMetadata;
    });

    const configuration = await service.getConfiguration();

    expect(configuration).toBeDefined();
    expect(configuration!.getChannelsOverrides()).toEqual({
      test: getMockAddress(),
    });
  });

  it("Returns null if metadata is not found", async () => {
    vi.spyOn(service.appConfigMetadataManager, "get").mockImplementationOnce(async () => {
      return undefined;
    });

    const configuration = await service.getConfiguration();

    expect(configuration).toBeNull();
  });
});
