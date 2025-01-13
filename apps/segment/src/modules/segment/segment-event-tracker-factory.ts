import { err, ok, Result } from "neverthrow";

import { BaseError } from "@/errors";

import { IAppConfigMetadataManager } from "../configuration/app-config-metadata-manager";
import { SegmentClient } from "./segment.client";
import { SegmentEventsTracker } from "./segment-events-tracker";

export interface ISegmentEventTrackerFactory {
  createFromAppConfig(): Promise<Result<SegmentEventsTracker, unknown>>;
}

export class SegmentEventTrackerFactory implements ISegmentEventTrackerFactory {
  static SegmentWriteKeyNotFoundError = BaseError.subclass("SegmentNotConfiguredError");

  constructor(
    private deps: {
      appConfigMetadataManager: IAppConfigMetadataManager;
    },
  ) {}

  async createFromAppConfig() {
    const config = await this.deps.appConfigMetadataManager.get();

    const segmentKey = config.getConfig()?.segmentWriteKey;

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
