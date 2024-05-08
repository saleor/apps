import { afterEach, describe, expect, it, vi } from "vitest";
import { FeatureFlagService } from "./feature-flag-service";
import * as fetchSaleorVersionExports from "./fetch-saleor-version";

import { Client } from "urql";

describe("FeatureFlagService", function () {
  const createMockedClient = () => ({}) as Client;

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("No API calls, when version is passed to the constructor", async () => {
    const passedVersion = "3.13.0";

    const service = new FeatureFlagService({
      client: createMockedClient(),
      saleorVersion: passedVersion,
    });

    const versionFetchSpy = vi
      .spyOn(fetchSaleorVersionExports, "fetchSaleorVersion")
      .mockResolvedValue("XXXX");

    expect(await service.getSaleorVersion()).toEqual(passedVersion);
    expect(versionFetchSpy).not.toHaveBeenCalled();
  });

  it("Use cached version, when once fetched", async () => {
    const fetchedVersion = "3.13.0";

    const service = new FeatureFlagService({
      client: createMockedClient(),
    });

    const versionFetchSpy = vi
      .spyOn(fetchSaleorVersionExports, "fetchSaleorVersion")
      .mockResolvedValue(fetchedVersion);

    expect(await service.getSaleorVersion()).toEqual(fetchedVersion);
    expect(versionFetchSpy).toHaveBeenCalledOnce();

    // Request version once again - should be cached
    expect(await service.getSaleorVersion()).toEqual(fetchedVersion);
    expect(versionFetchSpy).toHaveBeenCalledOnce();
  });
});
