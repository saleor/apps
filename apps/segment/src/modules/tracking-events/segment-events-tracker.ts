import { SegmentClient } from "../segment/segment.client";
import { TrackingBaseEvent } from "./tracking-events";

export class SegmentEventsTracker {
  constructor(private segmentClient: SegmentClient) {}

  async trackEvent(event: TrackingBaseEvent) {
    // Based on https://segment.com/docs/connections/sources/catalog/libraries/server/node/#usage-in-serverless-environments
    await new Promise((resolve) =>
      this.segmentClient.track(
        {
          event: event.type,
          user: event.user,
          properties: event.payload,
          issuedAt: event.issuedAt,
        },
        resolve,
      ),
    );
  }
}
