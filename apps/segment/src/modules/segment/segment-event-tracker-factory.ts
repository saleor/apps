import { err, ok, Result } from "neverthrow";

import { BaseError } from "@/errors";

import { AppConfig } from "../configuration/app-config";
import { SegmentClient } from "./segment.client";
import { SegmentEventsTracker } from "./segment-events-tracker";

export interface ISegmentEventTrackerFactory {
  createFromAppConfig(args: { config: AppConfig }): Promise<Result<SegmentEventsTracker, unknown>>;
}

export class SegmentEventTrackerFactory implements ISegmentEventTrackerFactory {
  static SegmentWriteKeyNotFoundError = BaseError.subclass("SegmentNotConfiguredError");
  static ConfigNotFoundError = BaseError.subclass("ConfigNotFoundError");

  constructor() {}

  async createFromAppConfig(args: { config: AppConfig }) {
    const config = args.config.getConfig();

    if (!config) {
      return err(new SegmentEventTrackerFactory.ConfigNotFoundError("App config not found"));
    }

    const segmentKey = config.segmentWriteKey;

    if (!segmentKey) {
      return err(
        new SegmentEventTrackerFactory.SegmentWriteKeyNotFoundError(
          "Segment write key not found in app config",
        ),
      );
    }

    return ok(
      new SegmentEventsTracker(
        new SegmentClient({
          segmentWriteKey: segmentKey,
        }),
      ),
    );
  }
}
