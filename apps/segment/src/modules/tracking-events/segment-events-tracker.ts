import { SegmentClient } from "../segment/segment.client";
import { TrackingSaleorEvent } from "./tracking-events";

export class SegmentEventsTracker {
  constructor(private segmentClient: SegmentClient) {}

  trackEvent(event: TrackingSaleorEvent) {
    this.segmentClient.track({
      event: event.type,
      userId: event.userId,
      properties: event.payload,
      userEmail: event.userEmail,
    });

    return this.segmentClient.flush();
  }
}
