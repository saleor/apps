import { AuthData } from "@saleor/app-sdk/APL";

import { BaseError } from "@/errors";

import { AppConfigMetadataManager } from "./configuration/app-config-metadata-manager";
import { SegmentClient } from "./segment/segment.client";
import { SegmentEventsTracker } from "./tracking-events/segment-events-tracker";

export const SegmentNotConfiguredError = BaseError.subclass("SegmentNotConfiguredError");

export const createSegmentClientForWebhookContext = async (context: { authData: AuthData }) => {
  const config = await AppConfigMetadataManager.createFromAuthData(context.authData).get();

  const segmentKey = config.getConfig()?.segmentWriteKey;

  if (!segmentKey) {
    throw new SegmentNotConfiguredError("Segment write key not found in app config");
  }

  return new SegmentEventsTracker(
    new SegmentClient({
      segmentWriteKey: segmentKey,
    }),
  );
};
