import { describe, expect, it } from "vitest";

import { AppConfig } from "../configuration/app-config";
import { SegmentEventTrackerFactory } from "./segment-event-tracker-factory";
import { SegmentEventsTracker } from "./segment-events-tracker";

describe("SegmentEventTrackerFactory", () => {
  it("should create an instance of SegmentEventsTracker from app config", async () => {
    const appConfig = new AppConfig({ segmentWriteKey: "key" });

    const factory = new SegmentEventTrackerFactory();

    const instance = await factory.createFromAppConfig({ config: appConfig });

    expect(instance._unsafeUnwrap()).toBeInstanceOf(SegmentEventsTracker);
  });
});
