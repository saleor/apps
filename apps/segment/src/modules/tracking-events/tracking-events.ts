import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

import { OrderBaseFragment } from "@/generated/graphql";

export type TrackingBaseEvent = {
  type: string;
  user: {
    id: string;
    type: "logged" | "anonymous";
  };
  payload: Record<string, unknown>;
  issuedAt: string | null | undefined;
};

const getUserInfo = ({ user, userEmail }: OrderBaseFragment) => {
  const stringValidator = z.string().min(1);

  const userId = user?.id ?? userEmail;

  const parsedUserId = stringValidator.safeParse(userId);

  if (parsedUserId.success) {
    return {
      id: parsedUserId.data,
      type: "logged",
    } as const;
  }

  return {
    // https://segment.com/docs/guides/working-with-ids/#segments-guidance-on-identifier-formats
    id: uuidv4(),
    type: "anonymous",
  } as const;
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
      user: getUserInfo(orderBase),
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
      user: getUserInfo(orderBase),
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
      user: getUserInfo(orderBase),
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
      user: getUserInfo(orderBase),
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
      user: getUserInfo(orderBase),
      issuedAt,
      payload: {
        ...order,
      },
    };
  },
};
