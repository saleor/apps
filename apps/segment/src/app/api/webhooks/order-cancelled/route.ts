"use client";

import { WebhookContext } from "@saleor/app-sdk/handlers/shared";
import { wrapWithLoggerContextAppRouter } from "@saleor/apps-logger/node";
import { ObservabilityAttributes } from "@saleor/apps-otel/src/observability-attributes";
import { wrapWithSpanAttributesAppRouter } from "@saleor/apps-otel/src/wrap-with-span-attributes";

import { OrderUpdatedSubscriptionPayloadFragment } from "@/generated/graphql";
import { createLogger } from "@/logger";
import { loggerContext } from "@/logger-context";
import { DynamoAppConfigManager } from "@/modules/configuration/dynamo-app-config-manager";
import { DynamoConfigRepositoryFactory } from "@/modules/db/dynamo-config-factory";
import { SegmentEventTrackerFactory } from "@/modules/segment/segment-event-tracker-factory";
import { TrackEventUseCase } from "@/modules/tracking-events/track-event.use-case";
import { trackingEventFactory } from "@/modules/tracking-events/tracking-events";
import { orderCancelledAsyncWebhook } from "@/modules/webhooks/definitions/order-cancelled";

const logger = createLogger("orderCancelledAsyncWebhook");

const configRepository = DynamoConfigRepositoryFactory.create();
const configManager = DynamoAppConfigManager.create(configRepository);
const segmentEventTrackerFactory = new SegmentEventTrackerFactory();
const useCase = new TrackEventUseCase({ segmentEventTrackerFactory });

type Ctx = WebhookContext<OrderUpdatedSubscriptionPayloadFragment>;

/*
 * todo handler export is missing from sdk
 * todo we need generics or something, to ensure response is NextResponse here
 */
const handler = async (req: Request, context: Ctx): Promise<Response> => {
  try {
    const { authData, payload } = context;

    const config = await configManager.get({
      saleorApiUrl: authData.saleorApiUrl,
      appId: authData.appId,
    });

    if (!config) {
      logger.warn("App config not found. Event won't be send to Segment");

      return Response.json({
        message: "App config not found. Event won't be send to Segment",
      });
    }

    if (!payload.order) {
      logger.info("Payload does not contain order data. Skipping.");

      return Response.json({
        message: "Payload does not contain order data. It will be skipped by app",
      });
    }

    loggerContext.set(ObservabilityAttributes.ORDER_ID, payload.order.id);

    const event = trackingEventFactory.createOrderCancelledEvent({
      orderBase: payload.order,
      issuedAt: payload.issuedAt,
    });

    return useCase.track(event, config).then((result) => {
      return result.match(
        () => {
          logger.info("Order cancelled event successfully sent to Segment");

          return Response.json({
            message: "Order cancelled event successfully sent to Segment",
          });
        },
        (error) => {
          switch (error.constructor) {
            case TrackEventUseCase.TrackEventUseCaseSegmentClientError: {
              logger.warn("Cannot create Segment Client. Event won't be send to Segment", {
                error: error,
              });

              return Response.json({
                message:
                  "Error during creating connection with Segment. Event won't be send to Segment",
              });
            }

            case TrackEventUseCase.TrackEventUseCaseUnknownError: {
              logger.error("Unknown error while sending order cancelled event to Segment", {
                error: error,
              });

              return Response.json(
                { message: "Error while sending order cancelled event to Segment" },
                {
                  status: 500,
                },
              );
            }
            default: {
              throw error;
            }
          }
        },
      );
    });
  } catch (e) {
    logger.error("Unhandled error while sending order cancelled event to Segment", { error: e });

    return Response.json(
      {
        message: "Error while sending order cancelled event to Segment",
      },
      { status: 500 },
    );
  }
};

/*
 * const wrapWithLogger = wrapWithLoggerContextAppRouter(loggerContext);
 *
 * const composedHandler = wrapWithLogger(
 *   wrapWithSpanAttributesAppRouter(orderCancelledAsyncWebhook.createHandler(handler)),
 * );
 */

export const POST = orderCancelledAsyncWebhook.createHandler(handler);
