import { OrderBaseFragment } from "../../../generated/graphql";

export type TrackingBaseEvent = {
  type: string;
  userId: string;
  userEmail: string;
  payload: Record<string, unknown>;
};

type OrderCreatedTrackingEvent = TrackingBaseEvent & {
  type: "order-created";
  payload: {
    orderId: string;
    channelId: string;
    channelSlug: string;
  };
};

// todo add more events
export const trackingEventFactory = {
  createOrderCreatedEvent(orderBase: OrderBaseFragment): OrderCreatedTrackingEvent {
    return {
      type: "order-created",
      // todo verify identity at this point, is possible to have this empty?
      userId: orderBase.user?.id ?? orderBase.userEmail,
      userEmail: orderBase.user?.email ?? orderBase.userEmail,
      payload: {
        orderId: orderBase.id,
        channelId: orderBase.channel.id,
        channelSlug: orderBase.channel.slug,
        channelName: orderBase.channel.name,
      },
    };
  },
};

export type TrackingSaleorEvent = OrderCreatedTrackingEvent;
