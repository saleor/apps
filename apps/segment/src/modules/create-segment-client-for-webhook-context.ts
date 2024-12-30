import { AuthData } from "@saleor/app-sdk/APL";
import { AppConfigMetadataManager } from "./configuration/app-config-metadata-manager";
import { SegmentEventsTracker } from "./tracking-events/segment-events-tracker";
import { SegmentClient } from "./segment/segment.client";
import { SegmentNotConfiguredError } from "@/errors";

export const createSegmentClientForWebhookContext = async (context: { authData: AuthData }) => {
  const config = await AppConfigMetadataManager.createFromAuthData(context.authData).get();

  const segmentKey = config.getConfig()?.segmentWriteKey;

  if (!segmentKey) {
    throw new SegmentNotConfiguredError();
  }

  return new SegmentEventsTracker(
    new SegmentClient({
      segmentWriteKey: segmentKey,
    }),
  );
};
