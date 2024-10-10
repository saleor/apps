import { ResultOf } from "@/graphql";

import { OrderConfirmedSubscription } from "../../../../graphql/subscriptions/OrderConfirmed";

export type OrderConfirmedPayload = Extract<
  ResultOf<typeof OrderConfirmedSubscription>,
  { __typename: "OrderConfirmed" }
>;
