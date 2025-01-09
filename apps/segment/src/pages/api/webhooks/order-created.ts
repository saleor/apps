import { NextWebhookApiHandler } from "@saleor/app-sdk/handlers/next";
import { wrapWithLoggerContext } from "@saleor/apps-logger/node";
import { withOtel } from "@saleor/apps-otel";
import { ObservabilityAttributes } from "@saleor/apps-otel/src/lib/observability-attributes";

import { OrderCreatedSubscriptionPayloadFragment } from "@/generated/graphql";
import { createLogger } from "@/logger";
import { loggerContext } from "@/logger-context";
import { AppConfigMetadataManager } from "@/modules/configuration/app-config-metadata-manager";
import { SegmentEventTrackerFactory } from "@/modules/segment/segment-event-tracker-factory";
import { TrackEventUseCase } from "@/modules/tracking-events/track-event.use-case";
import { trackingEventFactory } from "@/modules/tracking-events/tracking-events";
import { orderCreatedAsyncWebhook } from "@/modules/webhooks/definitions/order-created";

export const config = {
  api: {
    bodyParser: false,
  },
};

const logger = createLogger("orderCreatedAsyncWebhook");

const handler: NextWebhookApiHandler<OrderCreatedSubscriptionPayloadFragment> = async (
  req,
  res,
  context,
) => {
  const { authData, payload } = context;

  if (!payload.order) {
    logger.info("Payload does not contain order data. Skipping.");

    return res
      .status(200)
      .json({ message: "Payload does not contain order data. It will be skipped by app" });
  }

  loggerContext.set(ObservabilityAttributes.ORDER_ID, payload.order.id);

  try {
    const appConfigMetadataManager = AppConfigMetadataManager.createFromAuthData(authData);
    const segmentEventTrackerFactory = new SegmentEventTrackerFactory({ appConfigMetadataManager });
    const useCase = new TrackEventUseCase({ segmentEventTrackerFactory });

    const event = trackingEventFactory.createOrderCreatedEvent({
      orderBase: payload.order,
      issuedAt: payload.issuedAt,
    });

    return useCase.track(event).then((result) => {
      return result.match(
        () => {
          logger.info("Order created event successfully sent to Segment");

          return res
            .status(200)
            .json({ message: "Order created event successfully sent to Segment" });
        },
        (error) => {
          switch (error.constructor) {
            case TrackEventUseCase.TrackEventUseCaseSegmentClientError: {
              logger.warn("Cannot create Segment Client. Event won't be send to Segment", {
                error: error,
              });

              return res.status(200).json({
                message:
                  "Error during creating connection with Segment. Event won't be send to Segment",
              });
            }

            case TrackEventUseCase.TrackEventUseCaseUnknownError: {
              logger.error("Unknown error while sending order created event to Segment", {
                error: error,
              });

              return res
                .status(500)
                .json({ message: "Error while sending order created event to Segment" });
            }
          }
        },
      );
    });
  } catch (e) {
    logger.error("Unhandled error while sending order created event to Segment", { error: e });

    return res.status(500).json({ message: "Error while sending order created event to Segment" });
  }
};

export default wrapWithLoggerContext(
  withOtel(orderCreatedAsyncWebhook.createHandler(handler), "/api/webhooks/order-created"),
  loggerContext,
);
