import { z } from "zod";
import { OrderBaseFragment } from "../../../generated/graphql";

export type TrackingBaseEvent = {
  type: string;
  userId: string;
  userEmail?: string;
  payload: Record<string, unknown>;
};

type OrderCreatedTrackingEvent = TrackingBaseEvent & {
  type: "order-created";
};

const stringValidator = z.string().min(1);

// todo add more events
export const trackingEventFactory = {
  createOrderCreatedEvent(orderBase: OrderBaseFragment): OrderCreatedTrackingEvent {
    const { user, userEmail, ...order } = orderBase;

    const userId = user?.id ?? userEmail;

    const parsedUserId = stringValidator.parse(userId); // todo throw if doesnt exist

    return {
      type: "order-created",
      userId: parsedUserId,
      payload: {
        userEmail: orderBase.user?.email ?? orderBase.userEmail ?? undefined,
        ...order,
      },
    };
  },
};

export type TrackingSaleorEvent = OrderCreatedTrackingEvent;
