import { err, ok, Result } from "neverthrow";

import { BaseError } from "@/errors";

import { AppConfig } from "../configuration/app-config";
import { SegmentEventsTracker } from "./segment-events-tracker";
import { SegmentClient } from "./segment.client";

export interface ISegmentEventTrackerFactory {
  createFromAppConfig(args: { config: AppConfig }): Promise<Result<SegmentEventsTracker, unknown>>;
}

export class SegmentEventTrackerFactory implements ISegmentEventTrackerFactory {
  static SegmentWriteKeyNotFoundError = BaseError.subclass("SegmentNotConfiguredError");

  constructor() {}

  async createFromAppConfig(args: { config: AppConfig }) {
    const segmentKey = args.config.getConfig()?.segmentWriteKey;

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
