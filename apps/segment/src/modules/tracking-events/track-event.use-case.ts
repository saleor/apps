import { err, ResultAsync } from "neverthrow";

import { BaseError } from "@/errors";

import { AppConfig } from "../configuration/app-config";
import { ISegmentEventTrackerFactory } from "../segment/segment-event-tracker-factory";
import { TrackingBaseEvent } from "./tracking-events";

export class TrackEventUseCase {
  static TrackEventUseCaseUnknownError = BaseError.subclass("TrackEventUseCaseUnknowError");
  static TrackEventUseCaseSegmentClientError = BaseError.subclass("TrackEventUseCaseHandledError");

  constructor(
    private deps: {
      segmentEventTrackerFactory: ISegmentEventTrackerFactory;
    },
  ) {}

  async track(event: TrackingBaseEvent, config: AppConfig) {
    const segmentEventTrackerResult =
      await this.deps.segmentEventTrackerFactory.createFromAppConfig({ config });

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
