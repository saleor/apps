import { err, ok } from "neverthrow";
import { describe, expect, it, vi } from "vitest";

import { ISegmentClient } from "../segment/segment.client";
import { ISegmentEventTrackerFactory } from "../segment/segment-event-tracker-factory";
import { SegmentEventsTracker } from "../segment/segment-events-tracker";
import { mockedOrderBase } from "./__tests__/mocks";
import { TrackEventUseCase } from "./track-event.use-case";
import { trackingEventFactory } from "./tracking-events";

describe("TrackEventUseCase", () => {
  const mockedSegmentClient: ISegmentClient = {
    track: vi.fn(),
    flush: vi.fn(),
  };
  const mockedSegmentEventTracker = new SegmentEventsTracker(mockedSegmentClient);
  const mockedSegmentEventTrackerFactory: ISegmentEventTrackerFactory = {
    createFromAppConfig: () => {
      return Promise.resolve(ok(mockedSegmentEventTracker));
    },
  };

  it("creates instance", () => {
    const instance = new TrackEventUseCase({
      segmentEventTrackerFactory: mockedSegmentEventTrackerFactory,
    });

    expect(instance).toBeDefined();
  });

  it("successfully tracks event", async () => {
    const useCase = new TrackEventUseCase({
      segmentEventTrackerFactory: mockedSegmentEventTrackerFactory,
    });

    const event = trackingEventFactory.createOrderCreatedEvent({
      orderBase: mockedOrderBase,
      issuedAt: "2025-01-07",
    });

    await useCase.track(event);

    expect(mockedSegmentClient.track).toHaveBeenCalledWith({
      event: "Saleor Order Created",
      issuedAt: "2025-01-07",
      properties: {
        channel: {
          id: "channel-id",
          name: "channel-name",
          slug: "channel-slug",
        },
        id: "order-id",
        lines: [],
        number: "order-number",
        total: {
          gross: {
            amount: 37,
            currency: "USD",
          },
          net: {
            amount: 21,
            currency: "USD",
          },
        },
      },
      user: {
        id: "user-email",
        type: "logged",
      },
    });
  });

  it("returns error when creating Segment client fails", async () => {
    const mockedSegmentEventTrackerFactory: ISegmentEventTrackerFactory = {
      createFromAppConfig: () => {
        return Promise.resolve(err(new Error("Error while creating Segment client")));
      },
    };

    const useCase = new TrackEventUseCase({
      segmentEventTrackerFactory: mockedSegmentEventTrackerFactory,
    });

    const event = trackingEventFactory.createOrderCreatedEvent({
      orderBase: mockedOrderBase,
      issuedAt: "2025-01-07",
    });

    const result = await useCase.track(event);

    expect(result._unsafeUnwrapErr()).toBeInstanceOf(
      TrackEventUseCase.TrackEventUseCaseSegmentClientError,
    );
  });

  it("returns unknown error when tracking event fails", async () => {
    const mockedSegmentClient: ISegmentClient = {
      track: vi.fn(() => {
        throw new Error("Error while sending event to Segment");
      }),
      flush: vi.fn(),
    };
    const mockedSegmentEventTracker = new SegmentEventsTracker(mockedSegmentClient);
    const mockedSegmentEventTrackerFactory: ISegmentEventTrackerFactory = {
      createFromAppConfig: () => {
        return Promise.resolve(ok(mockedSegmentEventTracker));
      },
    };

    const useCase = new TrackEventUseCase({
      segmentEventTrackerFactory: mockedSegmentEventTrackerFactory,
    });

    const event = trackingEventFactory.createOrderCreatedEvent({
      orderBase: mockedOrderBase,
      issuedAt: "2025-01-07",
    });

    const result = await useCase.track(event);

    expect(result._unsafeUnwrapErr()).toBeInstanceOf(
      TrackEventUseCase.TrackEventUseCaseUnknownError,
    );
  });
});
