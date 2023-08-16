import { Analytics, TrackParams } from "@segment/analytics-node";

//https://segment.com/docs/connections/sources/catalog/libraries/server/node/#graceful-shutdown
export class SegmentClient {
  private readonly client: Analytics;

  constructor({ segmentWriteKey }: { segmentWriteKey: string }) {
    this.client = new Analytics({
      writeKey: segmentWriteKey,
      /**
       * Since client is used per-event there will be likely a single event per request.
       * The libarary is configured for a server architecture, where events are batched.
       * Here we set the batch size to 1 to avoid any delays and submit event instantly.
       */
      flushInterval: 1,
      maxEventsInBatch: 1,
    });
  }

  // https://segment.com/docs/connections/sources/catalog/libraries/server/node/#track
  track(event: Pick<TrackParams, "properties" | "event"> & { userId: string }) {
    this.client.track({
      ...event,
      timestamp: new Date(),
    });
  }

  flush() {
    return this.client.closeAndFlush({ timeout: 1000 });
  }
}
