import { SegmentClient } from "../segment/segment.client";
import { TrackingBaseEvent } from "./tracking-events";

export class SegmentEventsTracker {
  constructor(private segmentClient: SegmentClient) {}

  async trackEvent(event: TrackingBaseEvent) {
    this.segmentClient.track({
      event: event.type,
      userId: event.userId,
      properties: event.payload,
      issuedAt: event.issuedAt,
    });

    this.segmentClient.flush();
  }
}
