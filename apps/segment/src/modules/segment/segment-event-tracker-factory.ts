import { AuthData } from "@saleor/app-sdk/APL";
import { err, ok } from "neverthrow";

import { BaseError } from "@/errors";

import { AppConfigMetadataManager } from "../configuration/app-config-metadata-manager";
import { SegmentEventsTracker } from "../tracking-events/segment-events-tracker";
import { SegmentClient } from "./segment.client";

export const SegmentWriteKeyNotFoundError = BaseError.subclass("SegmentNotConfiguredError");

export class SegmentEventTrackerFactory {
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
