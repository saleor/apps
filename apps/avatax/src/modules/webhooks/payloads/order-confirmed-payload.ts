import { OrderConfirmedEventSubscriptionFragment } from "../../../../generated/graphql";

export type OrderConfirmedPayload = Extract<
  OrderConfirmedEventSubscriptionFragment,
  { __typename: "OrderConfirmed" }
>;
