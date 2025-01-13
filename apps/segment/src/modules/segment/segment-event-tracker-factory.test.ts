import { describe, expect, it, vi } from "vitest";

import { AppConfig } from "../configuration/app-config";
import { IAppConfigMetadataManager } from "../configuration/app-config-metadata-manager";
import { SegmentEventTrackerFactory } from "./segment-event-tracker-factory";
import { SegmentEventsTracker } from "./segment-events-tracker";

describe("SegmentEventTrackerFactory", () => {
  it("should create an instance of SegmentEventsTracker from app config", async () => {
    const appConfig = new AppConfig({ segmentWriteKey: "key" });
    const mockedAppConfigMetadataManager: IAppConfigMetadataManager = {
      get: vi.fn(() => Promise.resolve(appConfig)),
      set: vi.fn(),
    };
    const factory = new SegmentEventTrackerFactory({
      appConfigMetadataManager: mockedAppConfigMetadataManager,
    });

    const instance = await factory.createFromAppConfig();

    expect(instance._unsafeUnwrap()).toBeInstanceOf(SegmentEventsTracker);
  });

  it("should return error when segment write key is not found in app config", async () => {
    const appConfig = new AppConfig();
    const mockedAppConfigMetadataManager: IAppConfigMetadataManager = {
      get: vi.fn(() => Promise.resolve(appConfig)),
      set: vi.fn(),
    };
    const factory = new SegmentEventTrackerFactory({
      appConfigMetadataManager: mockedAppConfigMetadataManager,
    });

    const instance = await factory.createFromAppConfig();

    expect(instance._unsafeUnwrapErr()).toBeInstanceOf(
      SegmentEventTrackerFactory.SegmentWriteKeyNotFoundError,
    );
  });
});
