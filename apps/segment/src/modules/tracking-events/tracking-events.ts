import { z } from "zod";

import { OrderBaseFragment } from "../../../generated/graphql";

export type TrackingBaseEvent = {
  type: string;
  userId: string;
  payload: Record<string, unknown>;
  issuedAt: string | null | undefined;
};

const getUserId = ({ user, userEmail }: OrderBaseFragment) => {
  const stringValidator = z.string().min(1);

  const userId = user?.id ?? userEmail;

  const parsedUserId = stringValidator.safeParse(userId);

  if (parsedUserId.success) {
    return parsedUserId.data;
  }

  return "anonymous";
};

/**
 * Semantic events from Segment:
 * https://segment.com/docs/connections/spec/ecommerce/v2/
 */
export const trackingEventFactory = {
  createOrderCreatedEvent({
    orderBase,
    issuedAt,
  }: {
    orderBase: OrderBaseFragment;
    issuedAt: string | null | undefined;
  }): TrackingBaseEvent {
    const { user, userEmail, ...order } = orderBase;

    return {
      type: "Saleor Order Created",
      userId: getUserId(orderBase),
      issuedAt,
      payload: {
        ...order,
      },
    };
  },
  createOrderUpdatedEvent({
    orderBase,
    issuedAt,
  }: {
    orderBase: OrderBaseFragment;
    issuedAt: string | null | undefined;
  }): TrackingBaseEvent {
    const { user, userEmail, ...order } = orderBase;

    return {
      type: "Saleor Order Updated",
      userId: getUserId(orderBase),
      issuedAt,
      payload: {
        ...order,
      },
    };
  },
  createOrderCancelledEvent({
    orderBase,
    issuedAt,
  }: {
    orderBase: OrderBaseFragment;
    issuedAt: string | null | undefined;
  }): TrackingBaseEvent {
    const { user, userEmail, ...order } = orderBase;

    return {
      type: "Saleor Order Cancelled",
      userId: getUserId(orderBase),
      issuedAt,
      payload: {
        ...order,
      },
    };
  },
  createOrderRefundedEvent({
    orderBase,
    issuedAt,
  }: {
    orderBase: OrderBaseFragment;
    issuedAt: string | null | undefined;
  }): TrackingBaseEvent {
    const { user, userEmail, ...order } = orderBase;

    return {
      type: "Saleor Order Refunded",
      userId: getUserId(orderBase),
      issuedAt,
      payload: {
        ...order,
      },
    };
  },
  createOrderCompletedEvent({
    orderBase,
    issuedAt,
  }: {
    orderBase: OrderBaseFragment;
    issuedAt: string | null | undefined;
  }): TrackingBaseEvent {
    const { user, userEmail, ...order } = orderBase;

    return {
      type: "Saleor Order Completed",
      userId: getUserId(orderBase),
      issuedAt,
      payload: {
        ...order,
      },
    };
  },
};
