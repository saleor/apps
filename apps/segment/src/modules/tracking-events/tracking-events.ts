import { z } from "zod";
import { OrderBaseFragment } from "../../../generated/graphql";

export type TrackingBaseEvent = {
  type: string;
  userId: string;
  userEmail?: string;
  payload: Record<string, unknown>;
};

type OrderCreatedTrackingEvent = TrackingBaseEvent & {
  /**
   * https://segment.com/docs/connections/spec/ecommerce/v2/#core-ordering-overview
   */
  type: "Checkout Started";
};

type OrderUpdatedTrackingEvent = TrackingBaseEvent & {
  /**
   * https://segment.com/docs/connections/spec/ecommerce/v2/#core-ordering-overview
   */
  type: "Order Updated";
};

const getUserId = ({ user, userEmail }: OrderBaseFragment) => {
  const stringValidator = z.string().min(1);

  const userId = user?.id ?? userEmail;

  const parsedUserId = stringValidator.parse(userId); // todo throw if doesnt exist

  return parsedUserId;
};

// todo add more events
export const trackingEventFactory = {
  createOrderCreatedEvent(orderBase: OrderBaseFragment): OrderCreatedTrackingEvent {
    const { user, userEmail, ...order } = orderBase;

    return {
      type: "Checkout Started",
      userId: getUserId(orderBase),
      payload: {
        userEmail: orderBase.user?.email ?? orderBase.userEmail ?? undefined,
        ...order,
      },
    };
  },
  createOrderUpdatedEvent(orderBase: OrderBaseFragment): OrderUpdatedTrackingEvent {
    const { user, userEmail, ...order } = orderBase;

    return {
      type: "Order Updated",
      userId: getUserId(orderBase),
      payload: {
        userEmail: orderBase.user?.email ?? orderBase.userEmail ?? undefined,
        ...order,
      },
    };
  },
};

export type TrackingSaleorEvent = OrderCreatedTrackingEvent | OrderUpdatedTrackingEvent;
