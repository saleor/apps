import { OrderCancelledEventSubscriptionFragment } from "../../../../generated/graphql";

export type OrderCancelledPayload = Extract<
  OrderCancelledEventSubscriptionFragment,
  { __typename: "OrderCancelled" }
>;
