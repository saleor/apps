import { AuthData } from "@saleor/app-sdk/APL";
import { err, ok, Result } from "neverthrow";

import { BaseError } from "@/errors";

import { AppConfigMetadataManager } from "../configuration/app-config-metadata-manager";
import { SegmentClient } from "./segment.client";
import { SegmentEventsTracker } from "./segment-events-tracker";

export interface ISegmentEventTrackerFactory {
  createFromAuthData(authData: AuthData): Promise<Result<SegmentEventsTracker, unknown>>;
}

export class SegmentEventTrackerFactory implements ISegmentEventTrackerFactory {
  static SegmentWriteKeyNotFoundError = BaseError.subclass("SegmentNotConfiguredError");

  constructor() {}

  async createFromAuthData(authData: AuthData) {
    const config = await AppConfigMetadataManager.createFromAuthData(authData).get();

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
