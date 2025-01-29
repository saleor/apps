import { TrackingBaseEvent } from "../tracking-events/tracking-events";
import { ISegmentClient } from "./segment.client";

export class SegmentEventsTracker {
  constructor(private segmentClient: ISegmentClient) {}

  async trackEvent(event: TrackingBaseEvent) {
    // Based on https://segment.com/docs/connections/sources/catalog/libraries/server/node/#usage-in-serverless-environments
    this.segmentClient.track({
      event: event.type,
      user: event.user,
      properties: event.payload,
      issuedAt: event.issuedAt,
    });

    await this.segmentClient.flush();
  }
}
