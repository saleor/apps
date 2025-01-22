import { err, ok } from "neverthrow";
import { describe, expect, it, vi } from "vitest";

import { AppConfig } from "../configuration/app-config";
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
  const mockedAppConfig = new AppConfig({ segmentWriteKey: "key" });

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

    const event = trackingEventFactory.createOrderUpdatedEvent({
      orderBase: mockedOrderBase,
      issuedAt: "2025-01-07",
    });

    await useCase.track(event, mockedAppConfig);

    expect(mockedSegmentClient.track).toHaveBeenCalledWith({
      event: "Saleor Order Updated",
      issuedAt: "2025-01-07",
      properties: {
        coupon: undefined,
        currency: "USD",
        discount: 7,
        order_id: "order-id",
        products: [
          {
            category: "categoryName",
            coupon: undefined,
            name: "productName",
            price: 37,
            product_id: "line-id",
            quantity: 1,
            sku: "sku",
            variant: "variantName",
          },
        ],
        shipping: 5,
        tax: 0.21,
        total: 37,
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

    const event = trackingEventFactory.createOrderUpdatedEvent({
      orderBase: mockedOrderBase,
      issuedAt: "2025-01-07",
    });

    const result = await useCase.track(event, mockedAppConfig);

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

    const event = trackingEventFactory.createOrderUpdatedEvent({
      orderBase: mockedOrderBase,
      issuedAt: "2025-01-07",
    });

    const result = await useCase.track(event, mockedAppConfig);

    expect(result._unsafeUnwrapErr()).toBeInstanceOf(
      TrackEventUseCase.TrackEventUseCaseUnknownError,
    );
  });
});
