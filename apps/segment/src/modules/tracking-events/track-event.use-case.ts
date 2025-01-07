import { AuthData } from "@saleor/app-sdk/APL";
import { err, ResultAsync } from "neverthrow";

import { BaseError } from "@/errors";

import { SegmentEventTrackerFactory } from "../segment/segment-event-tracker-factory";
import { TrackingBaseEvent } from "./tracking-events";

export class TrackEventUseCase {
  static TrackEventUseCaseUnknownError = BaseError.subclass("TrackEventUseCaseUnknowError");
  static TrackEventUseCaseSegmentClientError = BaseError.subclass("TrackEventUseCaseHandledError");

  constructor(
    private deps: {
      segmentEventTrackerFactory: SegmentEventTrackerFactory;
    },
  ) {}

  async track(event: TrackingBaseEvent, authData: AuthData) {
    const segmentEventTrackerResult =
      await this.deps.segmentEventTrackerFactory.createFromAuthData(authData);

    if (segmentEventTrackerResult.isErr()) {
      return err(
        new TrackEventUseCase.TrackEventUseCaseSegmentClientError(
          "Error while creating Segment client",
          {
            cause: segmentEventTrackerResult.error,
          },
        ),
      );
    }

    return ResultAsync.fromPromise(segmentEventTrackerResult.value.trackEvent(event), (error) => {
      return new TrackEventUseCase.TrackEventUseCaseUnknownError(
        "Error while sending event to Segment",
        {
          cause: error,
        },
      );
    });
  }
}
