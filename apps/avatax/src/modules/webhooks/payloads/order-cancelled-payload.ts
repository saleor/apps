import { OrderCancelledEventSubscriptionFragmentResult } from "../../../../graphql/subscriptions/OrderCancelled";

export type OrderCancelledPayload = Extract<
  OrderCancelledEventSubscriptionFragmentResult,
  { __typename: "OrderCancelled" }
>;
