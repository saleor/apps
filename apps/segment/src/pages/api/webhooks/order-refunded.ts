import { NextWebhookApiHandler } from "@saleor/app-sdk/handlers/next";
import { wrapWithLoggerContext } from "@saleor/apps-logger/node";
import { ObservabilityAttributes } from "@saleor/apps-otel/src/observability-attributes";
import { wrapWithSpanAttributes } from "@saleor/apps-otel/src/wrap-with-span-attributes";

import { OrderRefundedSubscriptionPayloadFragment } from "@/generated/graphql";
import { createLogger } from "@/logger";
import { loggerContext } from "@/logger-context";
import { DynamoAppConfigManager } from "@/modules/configuration/dynamo-app-config-manager";
import { DynamoConfigRepositoryFactory } from "@/modules/db/dynamo-config-factory";
import { SegmentEventTrackerFactory } from "@/modules/segment/segment-event-tracker-factory";
import { TrackEventUseCase } from "@/modules/tracking-events/track-event.use-case";
import { trackingEventFactory } from "@/modules/tracking-events/tracking-events";
import { orderRefundedAsyncWebhook } from "@/modules/webhooks/definitions/order-refunded";

export const config = {
  api: {
    bodyParser: false,
  },
};

const logger = createLogger("orderRefundedAsyncWebhook");

const configRepository = DynamoConfigRepositoryFactory.create();
const configManager = DynamoAppConfigManager.create(configRepository);
const segmentEventTrackerFactory = new SegmentEventTrackerFactory();
const useCase = new TrackEventUseCase({ segmentEventTrackerFactory });

const handler: NextWebhookApiHandler<OrderRefundedSubscriptionPayloadFragment> = async (
  req,
  res,
  context,
) => {
  try {
    const { authData, payload } = context;

    const config = await configManager.get({
      saleorApiUrl: authData.saleorApiUrl,
      appId: authData.appId,
    });

    if (!config) {
      logger.warn("App config not found. Event won't be send to Segment");

      return res.status(200).json({
        message: "App config not found. Event won't be send to Segment",
      });
    }

    if (!payload.order) {
      logger.info("Payload does not contain order data. Skipping.");

      return res
        .status(200)
        .json({ message: "Payload does not contain order data. It will be skipped by app" });
    }

    loggerContext.set(ObservabilityAttributes.ORDER_ID, payload.order.id);

    const event = trackingEventFactory.createOrderRefundedEvent({
      orderBase: payload.order,
      issuedAt: payload.issuedAt,
    });

    return useCase.track(event, config).then((result) => {
      return result.match(
        () => {
          logger.info("Order refunded event successfully sent to Segment");

          return res
            .status(200)
            .json({ message: "Order refunded event successfully sent to Segment" });
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
              logger.error("Unknown error while sending order refunded event to Segment", {
                error: error,
              });

              return res
                .status(500)
                .json({ message: "Error while sending order refunded event to Segment" });
            }
          }
        },
      );
    });
  } catch (e) {
    logger.error("Unhandled error while sending order refunded event to Segment", { error: e });

    return res.status(500).json({ message: "Error while sending order refunded event to Segment" });
  }
};

export default wrapWithLoggerContext(
  wrapWithSpanAttributes(orderRefundedAsyncWebhook.createHandler(handler)),
  loggerContext,
);
