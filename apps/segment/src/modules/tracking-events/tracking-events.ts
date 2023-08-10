import { z } from "zod";
import { OrderBaseFragment } from "../../../generated/graphql";

export type TrackingBaseEvent = {
  type: string;
  userId: string;
  payload: Record<string, unknown>;
};

const getUserId = ({ user, userEmail }: OrderBaseFragment) => {
  const stringValidator = z.string().min(1);

  const userId = user?.id ?? userEmail;

  const parsedUserId = stringValidator.parse(userId); // todo throw if doesnt exist

  return parsedUserId;
};

/**
 * Semantic events from Segment:
 * https://segment.com/docs/connections/spec/ecommerce/v2/
 */
export const trackingEventFactory = {
  createOrderCreatedEvent(orderBase: OrderBaseFragment): TrackingBaseEvent {
    const { user, userEmail, ...order } = orderBase;

    return {
      type: "Checkout Started",
      userId: getUserId(orderBase),
      payload: {
        ...order,
      },
    };
  },
  createOrderUpdatedEvent(orderBase: OrderBaseFragment): TrackingBaseEvent {
    const { user, userEmail, ...order } = orderBase;

    return {
      type: "Order Updated",
      userId: getUserId(orderBase),
      payload: {
        ...order,
      },
    };
  },
  createOrderCancelledEvent(orderBase: OrderBaseFragment): TrackingBaseEvent {
    const { user, userEmail, ...order } = orderBase;

    return {
      type: "Order Cancelled",
      userId: getUserId(orderBase),
      payload: {
        ...order,
      },
    };
  },
  createOrderRefundedEvent(orderBase: OrderBaseFragment): TrackingBaseEvent {
    const { user, userEmail, ...order } = orderBase;

    return {
      type: "Order Refunded",
      userId: getUserId(orderBase),
      payload: {
        ...order,
      },
    };
  },
};
