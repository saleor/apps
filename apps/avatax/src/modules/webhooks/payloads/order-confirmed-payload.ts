import { ResultOf } from "@/graphql";

import {
  OrderConfirmedEventFragment,
  OrderConfirmedSubscription,
} from "../../../../graphql/subscriptions/OrderConfirmed";

export type OrderConfirmedPayload = Extract<
  ResultOf<typeof OrderConfirmedEventFragment>,
  { __typename: "OrderConfirmed" }
>;
