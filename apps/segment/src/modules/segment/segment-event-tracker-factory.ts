import { ok, Result } from "neverthrow";

import { BaseError } from "@/errors";

import { AppConfig } from "../configuration/app-config";
import { SegmentClient } from "./segment.client";
import { SegmentEventsTracker } from "./segment-events-tracker";

export interface ISegmentEventTrackerFactory {
  createFromAppConfig(args: { config: AppConfig }): Promise<Result<SegmentEventsTracker, unknown>>;
}

export class SegmentEventTrackerFactory implements ISegmentEventTrackerFactory {
  static SegmentWriteKeyNotFoundError = BaseError.subclass("SegmentNotConfiguredError");

  constructor() {}

  async createFromAppConfig(args: { config: AppConfig }) {
    const segmentKey = args.config.getSegmentWriteKey();

    return ok(
      new SegmentEventsTracker(
        new SegmentClient({
          segmentWriteKey: segmentKey,
        }),
      ),
    );
  }
}
