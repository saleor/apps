import { Analytics, TrackParams } from "@segment/analytics-node";

import packageJson from "../../../package.json";
import { TrackingBaseEvent } from "../tracking-events/tracking-events";

export type EventToTrack = Pick<TrackParams, "properties" | "event"> &
  Pick<TrackingBaseEvent, "user" | "issuedAt">;

export interface ISegmentClient {
  track(event: EventToTrack): void;
  flush(): Promise<void>;
}

export class SegmentClient implements ISegmentClient {
  private readonly client: Analytics;

  constructor({ segmentWriteKey }: { segmentWriteKey: string }) {
    this.client = new Analytics({
      writeKey: segmentWriteKey,
      /**
       * Since client is used per-event there will be likely a single event per request.
       * The library is configured for a server architecture, where events are batched.
       * Here we set the batch size to 1 to avoid any delays and submit event instantly.
       */
      flushInterval: 1,
      maxEventsInBatch: 1,
    });
  }

  // https://segment.com/docs/connections/sources/catalog/libraries/server/node/#track
  track(event: EventToTrack) {
    const { issuedAt, user, ...eventProps } = event;

    // https://segment.com/docs/connections/sources/catalog/libraries/website/javascript/identity/
    const userInfo = user.type === "logged" ? { userId: user.id } : { anonymousId: user.id };

    this.client.track({
      ...eventProps,
      ...userInfo,
      timestamp: issuedAt ? new Date(issuedAt) : new Date(), // use timestamp from Saleor event as events may be async or fallback to current date
      context: {
        app: {
          name: "Saleor Segment app",
          version: packageJson.version,
        },
      },
    });
  }

  flush() {
    // https://segment.com/docs/connections/sources/catalog/libraries/server/node/#graceful-shutdown
    return this.client.closeAndFlush({ timeout: 1000 });
  }
}
