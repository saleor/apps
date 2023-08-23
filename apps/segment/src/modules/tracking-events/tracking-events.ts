import { z } from "zod";
import { OrderBaseFragment } from "../../../generated/graphql";

import * as Sentry from "@sentry/nextjs";

export type TrackingBaseEvent = {
  type: string;
  userId: string;
  payload: Record<string, unknown>;
};

const getUserId = ({ user, userEmail }: OrderBaseFragment) => {
  const stringValidator = z.string().min(1);

  const userId = user?.id ?? userEmail;

  try {
    const parsedUserId = stringValidator.parse(userId);

    return parsedUserId;
  } catch (e) {
    Sentry.captureMessage(
      "User ID resolution failed. Both user.id and userEmail are empty in order",
    );
    Sentry.captureException(e);

    throw e;
  }
};

/**
 * Semantic events from Segment:
 * https://segment.com/docs/connections/spec/ecommerce/v2/
 */
export const trackingEventFactory = {
  createOrderCreatedEvent(orderBase: OrderBaseFragment): TrackingBaseEvent {
    const { user, userEmail, ...order } = orderBase;

    return {
      type: "Saleor Order Created",
      userId: getUserId(orderBase),
      payload: {
        ...order,
      },
    };
  },
  createOrderUpdatedEvent(orderBase: OrderBaseFragment): TrackingBaseEvent {
    const { user, userEmail, ...order } = orderBase;

    return {
      type: "Saleor Order Updated",
      userId: getUserId(orderBase),
      payload: {
        ...order,
      },
    };
  },
  createOrderCancelledEvent(orderBase: OrderBaseFragment): TrackingBaseEvent {
    const { user, userEmail, ...order } = orderBase;

    return {
      type: "Saleor Order Cancelled",
      userId: getUserId(orderBase),
      payload: {
        ...order,
      },
    };
  },
  createOrderRefundedEvent(orderBase: OrderBaseFragment): TrackingBaseEvent {
    const { user, userEmail, ...order } = orderBase;

    return {
      type: "Saleor Order Refunded",
      userId: getUserId(orderBase),
      payload: {
        ...order,
      },
    };
  },
  createOrderCompletedEvent(orderBase: OrderBaseFragment): TrackingBaseEvent {
    const { user, userEmail, ...order } = orderBase;

    return {
      type: "Saleor Order Completed",
      userId: getUserId(orderBase),
      payload: {
        ...order,
      },
    };
  },
};
